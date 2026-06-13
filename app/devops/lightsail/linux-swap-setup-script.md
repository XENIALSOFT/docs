# Linux Swap 메모리 설정 및 커널 최적화 스크립트

Amazon Lightsail 인스턴스(RAM 2GB 기준)의 안정성 확보를 위한 스왑 메모리 4GB 구성 및 클라우드 환경 최적화 스크립트 가이드입니다.

## 자동화 스크립트 (Bash)

서버 터미널에 root 또는 sudo 권한을 가진 계정으로 접속하여 아래 스크립트를 실행하거나, 단일 셸 파일(e.g., `setup-swap.sh`)로 작성하여 구동하십시오.

```bash
#!/bin/bash
set -e

echo "========================================="
echo " Linux Swap Memory (4GB) Setup Script    "
echo "========================================="
```

# 1. 기존 스왑 파일 존재 유무 확인 및 생성
```bash
if [ -f /swapfile ]; then
    echo "[안내] 이미 /swapfile이 존재합니다. 세팅을 건너뜁니다."
else
    echo "[1/4] 4GB 크기의 빈 스왑 파일 할당 중 (fallocate)..."
    sudo fallocate -l 4G /swapfile
    
    echo "[2/4] 스왑 파일 보안 권한 변경 (chmod 600)..."
    sudo chmod 600 /swapfile
    
    echo "[3/4] 스왑 포맷 생성 및 활성화 (mkswap, swapon)..."
    sudo mkswap /swapfile
    sudo swapon /swapfile
    
    echo "[4/4] 부팅 시 자동 마운트를 위한 /etc/fstab 등록..."
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✔ 스왑 파일 활성화 완료!"
fi

echo "-----------------------------------------"
echo " 커널 Swappiness 최적화 설정 (SSD I/O 보호)"
echo "-----------------------------------------"
```

# 2. Swappiness 값을 10으로 하향 조정 (RAM 임계점 도달 시에만 Swap 사용)

```bash
CURRENT_SWAP_VAL=$(cat /proc/sys/vm/swappiness)
echo "[현재 설정값] swappiness = ${CURRENT_SWAP_VAL}"

if [ "$CURRENT_SWAP_VAL" -eq 10 ]; then
    echo "[안내] 이미 swappiness 값이 10으로 최적화되어 있습니다."
else
    echo "[변경] swappiness를 10으로 임시 변경 중..."
    sudo sysctl vm.swappiness=10
    
    echo "[변경] 영구 반영을 위해 /etc/sysctl.conf에 등록..."
    echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
    echo "✔ 커널 최적화 완료!"
fi

echo "========================================="
echo " 현재 메모리 할당 상태 확인              "
echo "========================================="
free -h
```

# 3. 수동 명령줄 세팅 가이드

스크립트를 쓰지 않고 터미널에서 한 줄씩 직접 실행하려면 아래 커맨드를 순차적으로 입력합니다.

```bash
# 4GB 크기의 가상 스왑 파일 생성
sudo fallocate -l 4G /swapfile

# 파일 소유자만 읽고 쓸 수 있도록 권한 격리
sudo chmod 600 /swapfile

# 스왑 영역으로 시스템 포맷
sudo mkswap /swapfile

# 가상 메모리 시스템에 스왑 등록
sudo swapon /swapfile

# 재부팅 시 영구 마운트 설정 추가
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 커널 swappiness 설정 영구 수정 (메모리 우선 활용)
sudo sysctl vm.swappiness=10
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
```