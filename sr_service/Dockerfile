FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y libgl1 libglib2.0-0 wget && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install "setuptools<70.0.0" wheel
RUN pip install --no-cache-dir -r requirements.txt
# Download model weights at build time
RUN mkdir -p /app/weights && \
     wget -q "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth" \
     -O /app/weights/RealESRGAN_x4plus.pth && \
     wget -q "https://github.com/TencentARC/GFPGAN/releases/download/v1.3.4/GFPGANv1.4.pth" \
     -O /app/weights/GFPGANv1.4.pth
COPY . .
EXPOSE 7001
CMD ["python", "app.py"]
