"""
Agent proxy module for handling Cortex Agent API requests.
"""
import logging
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Any, Dict, Optional, AsyncGenerator
import httpx
import json
from .config import settings
from .auth import get_current_user
from .snowflake_client import create_http_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/agent", tags=["agent"])


class AgentRequest(BaseModel):
    """Request body for agent interactions"""
    thread_id: Optional[int] = None
    parent_message_id: Optional[int] = None
    messages: list
    tool_choice: Optional[Dict[str, Any]] = None


def prepare_agent_request(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prepare the request to send to the Cortex Agent API.
    
    This function can be overridden by developers to customize the request format.
    
    Args:
        request_data: The incoming request data from the frontend
        
    Returns:
        The formatted request to send to the Cortex Agent API
    """
    # Default implementation: pass through as-is
    return request_data


def should_filter_field(field_name: str) -> bool:
    """
    Determine if a field should be filtered from the response.
    
    Args:
        field_name: The name of the field
        
    Returns:
        True if the field should be removed
    """
    if settings.REMOVE_SQL_FROM_RESPONSE and field_name == "sql":
        return True
    return False


def filter_event_data(event_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Filter fields from event data based on configuration.
    
    Args:
        event_data: The event data dictionary
        
    Returns:
        Filtered event data
    """
    if not settings.REMOVE_SQL_FROM_RESPONSE:
        return event_data
    
    # Recursively remove 'sql' fields
    filtered = {}
    for key, value in event_data.items():
        if key == "sql":
            continue
        elif isinstance(value, dict):
            filtered[key] = filter_event_data(value)
        elif isinstance(value, list):
            filtered[key] = [
                filter_event_data(item) if isinstance(item, dict) else item
                for item in value
            ]
        else:
            filtered[key] = value
    
    return filtered


async def stream_agent_response(
    request_data: Dict[str, Any]
) -> AsyncGenerator[str, None]:
    """
    Stream responses from the Cortex Agent API.
    
    Args:
        request_data: The request data to send to the API
        
    Yields:
        Server-sent event formatted strings
    """
    logger.info(f"Starting agent request stream")
    # Prepare the request (allow customization)
    prepared_request = prepare_agent_request(request_data)
    logger.debug(f"Prepared request: {prepared_request}")
    
    async with create_http_client() as client:
        try:
            async with client.stream(
                "POST",
                settings.SNOWFLAKE_AGENT_API_ENDPOINT,
                json=prepared_request
            ) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Cortex API error: {error_text.decode()}"
                    )
                
                # Stream the response line by line
                async for line in response.aiter_lines():
                    if line.strip():
                        # Parse SSE format: "event: <type>\ndata: <json>\n\n"
                        if line.startswith("event:"):
                            event_type = line[6:].strip()
                            yield f"event: {event_type}\n"
                        elif line.startswith("data:"):
                            data_str = line[5:].strip()
                            try:
                                # Parse and optionally filter the data
                                data = json.loads(data_str)
                                filtered_data = filter_event_data(data)
                                yield f"data: {json.dumps(filtered_data)}\n"
                            except json.JSONDecodeError:
                                # If not JSON, pass through as-is
                                yield f"data: {data_str}\n"
                        else:
                            yield f"{line}\n"
                    else:
                        # Empty line separates events
                        yield "\n"
                        
        except httpx.RequestError as e:
            error_event = {
                "event": "error",
                "data": json.dumps({"error": str(e)})
            }
            yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"


@router.post("/run")
async def run_agent(
    request: AgentRequest,
    username: str = Depends(get_current_user)
):
    """
    Proxy endpoint for Cortex Agent API requests.
    
    Args:
        request: The agent request from the frontend
        username: Authenticated user from session
        
    Returns:
        Streaming response with agent events
    """
    logger.info(f"Agent request from user: {username}")
    request_dict = request.model_dump(exclude_none=True)
    
    return StreamingResponse(
        stream_agent_response(request_dict),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

