"""WebSocket endpoint for real-time training updates"""
import json
import asyncio
from fastapi import WebSocket
from datetime import datetime

from .dependencies import get_redis_client

async def websocket_endpoint(ws: WebSocket, job_id: str):
    """WebSocket endpoint for real-time training updates"""
    await ws.accept()
    
    client = get_redis_client()
    if client is None:
        await ws.send_json({
            "type": "error",
            "error": "Redis not connected",
            "message": "Redis server is not available"
        })
        await ws.close()
        return
    
    pubsub = client.pubsub()
    pubsub.subscribe(f"job_{job_id}")

    try:
        await ws.send_json({
            "type": "connected",
            "job_id": job_id,
            "message": "WebSocket connected successfully"
        })
        
        try:
            status_data = client.get(f"job_status:{job_id}")
            if status_data:
                status = json.loads(status_data)
                await ws.send_json({
                    "type": "status",
                    "status": status.get("status", "accepted"),
                    "job_id": job_id,
                    "message": f"Job status: {status.get('status', 'accepted')}"
                })
        except Exception as e:
            print(f"Error sending initial status: {e}")
        
        last_ping = datetime.now()
        ping_interval = 10
        
        while True:
            message = pubsub.get_message(ignore_subscribe_messages=True)
            if message:
                try:
                    data = json.loads(message["data"]) if isinstance(message["data"], str) else message["data"]
                    await ws.send_json(data)
                    last_ping = datetime.now()
                except (json.JSONDecodeError, TypeError) as e:
                    print(f"Error parsing message: {e}")
                    try:
                        await ws.send_json(
                            message["data"] if isinstance(message["data"], dict) 
                            else {"data": str(message["data"])}
                        )
                    except:
                        break
            else:
                if (datetime.now() - last_ping).total_seconds() >= ping_interval:
                    try:
                        await ws.send_json({
                            "type": "ping", 
                            "timestamp": datetime.now().isoformat()
                        })
                        last_ping = datetime.now()
                    except:
                        break
                
                await asyncio.sleep(1.0)
                
    except Exception as e:
        print(f"WebSocket error for {job_id}: {e}")
        try:
            await ws.send_json({
                "type": "error",
                "error": str(e),
                "message": f"WebSocket error: {str(e)}"
            })
        except:
            pass
    finally:
        try:
            pubsub.unsubscribe(f"job_{job_id}")
            pubsub.close()
        except:
            pass
        try:
            await ws.close()
        except:
            pass
