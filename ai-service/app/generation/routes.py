from fastapi import APIRouter, HTTPException, status
from pydantic import ValidationError

from app.generation.study_generator import generate_study_pack
from app.schemas.study_pack import StudyPackRequest, StudyPackResponse

router = APIRouter(
    prefix="/api/v1/study",
    tags=["Study Resources"],
)


@router.post(
    "/generate",
    response_model=StudyPackResponse,
)
async def create_study_pack(
    request: StudyPackRequest,
):
    try:
        return await generate_study_pack(request)

    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI returned an invalid study pack. Please retry.",
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Study pack generation failed. Please try again.",
        ) from exc
