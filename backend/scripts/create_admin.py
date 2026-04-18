import asyncio
import secrets
import string
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select

from app.core.security import hash_password
from app.database import AsyncSessionLocal
from app.models.user import User, UserRole


def generate_password(length: int = 16) -> str:
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


async def create_admin() -> None:
    name = "Test Admin"
    email = f"admin+{secrets.token_hex(4)}@example.com"
    password = generate_password()

    async with AsyncSessionLocal() as db:
        existing = await db.execute(select(User).where(User.email == email))
        if existing.scalar_one_or_none():
            print(f"User {email} already exists")
            return

        user = User(
            name=name,
            email=email,
            hashed_password=hash_password(password),
            role=UserRole.admin,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    print("Admin user created:")
    print(f"  id:       {user.id}")
    print(f"  name:     {name}")
    print(f"  email:    {email}")
    print(f"  password: {password}")
    print(f"  role:     {user.role.value}")


if __name__ == "__main__":
    asyncio.run(create_admin())
