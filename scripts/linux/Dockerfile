# Lighthouse 13.5 in Linux Chromium, as PageSpeed runs it (2026-10-25): Debian's fonts, so a page falls back to DejaVu
# Sans, Liberation Sans or Roboto as a Linux machine or a phone does. Build once with `colima start` and
# `docker build -t enc-lh scripts/linux`; run with the repo mounted at /repo (docs/audit.md, "The phone's layout shift").
FROM node:22-bookworm
RUN apt-get update && apt-get install -y --no-install-recommends chromium fonts-dejavu-core fonts-liberation fonts-roboto-unhinted && rm -rf /var/lib/apt/lists/*
RUN npm i -g lighthouse@13.5.0
ENV CHROME_PATH=/usr/bin/chromium
WORKDIR /out
