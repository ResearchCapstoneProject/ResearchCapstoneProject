"""Settings, read from the environment (see .env.example at the repo root)."""
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# src/backend/app/config.py -> repo root
REPO_ROOT = Path(__file__).resolve().parents[3]
FRONTEND_DIR = REPO_ROOT / "src" / "frontend"
SEED_DIR = FRONTEND_DIR / "assets" / "seed"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=REPO_ROOT / ".env", env_file_encoding="utf-8", extra="ignore"
    )

    database_url: str = "mysql+pymysql://bnm:bnm@127.0.0.1:3307/bnm?charset=utf8mb4"

    session_secret: str = ""
    cookie_secure: bool = False
    cookie_name: str = "bnm_session"
    csrf_cookie_name: str = "bnm_csrf"
    session_hours: int = 12
    session_max_days: int = 7

    # Baked into printed QR codes. On pilot day set this to the museum's LAN
    # IP or real domain and every new label follows, with no code change.
    public_base_url: str = "http://localhost:8000"

    upload_dir: Path = Path("/data/uploads")
    max_upload_bytes: int = 8 * 1024 * 1024
    # Brochures and magazines are bigger than photographs; the museum's own
    # Zebra's Voice issues run to a few dozen megabytes.
    max_pdf_bytes: int = 32 * 1024 * 1024
    image_max_edge: int = 1600

    # ------------------------------------------------------------- e-mail
    # mail_mode decides what happens to a message:
    #   off     -- nothing is sent, and the site says e-mail is not available
    #   outbox  -- written to mail_outbox_dir as a file, for development and
    #              for the tests; the site behaves as if it had been sent
    #   smtp    -- handed to smtp_host
    # A deployment with no mail account therefore needs no code change, and a
    # developer can see what visitors would receive without sending anything.
    mail_mode: str = "off"
    mail_outbox_dir: Path = Path("/data/outbox")
    mail_from: str = "Botswana National Museum <no-reply@localhost>"
    mail_reply_to: str = ""
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_starttls: bool = True
    smtp_timeout: int = 10

    seed_on_start: bool = True
    demo_reset_enabled: bool = True

    # 'like' reproduces the prototype's substring search exactly.
    # 'fulltext' uses the ft_object index -- read doc/ARCHITECTURE.md first.
    search_mode: str = "like"

    cors_origins: str = ""

    admin_bootstrap_user: str = "admin"
    admin_bootstrap_password: str = ""

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
