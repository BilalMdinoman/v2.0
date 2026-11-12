"""Base agent. All seven agents share this minimal runner."""

from __future__ import annotations

from backend.services import llm


class Agent:
    def __init__(
        self,
        key: str,
        name: str,
        role: str,
        model: str,
        system_prompt: str,
        provider: str = "groq",
    ):
        self.key = key
        self.name = name
        self.role = role
        self.model = model
        self.system_prompt = system_prompt
        self.provider = provider

    def run(self, user_message: str) -> str:
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": user_message},
        ]
        if self.provider == "openrouter":
            return llm.openrouter_chat(self.model, messages)
        if self.provider == "xai":
            return llm.xai_chat(self.model, messages)
        return llm.groq_chat(self.model, messages)
