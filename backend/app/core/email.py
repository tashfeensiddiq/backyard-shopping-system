import os
import smtplib

from email.message import EmailMessage


def send_verification_email(to_email: str, code: str):
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    sender_email = os.getenv("SMTP_FROM", smtp_user)

    if not all([smtp_host, smtp_user, smtp_password, sender_email]):
        raise RuntimeError("SMTP configuration is incomplete.")

    message = EmailMessage()

    message["Subject"] = "Backyard Shopping | Email Verification"
    message["From"] = sender_email
    message["To"] = to_email

    message.set_content(
        f"""
Welcome to Backyard Shopping!

Your email verification code is:

{code}

This code expires in 10 minutes.

If you did not create an account, please ignore this email.
"""
    )

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(message)