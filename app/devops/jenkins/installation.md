---
prev: false
outline: deep
---

# 젠킨스 설치

## 설치

- `APT` 최신화
```sh
sudo apt update
```

- `젠킨스` 설치
```sh
sudo wget -O /etc/apt/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key
echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install jenkins
```

- `fontconfig` 설치
```sh
sudo apt-get update && sudo apt-get install fontconfig
```

## 포트 변경

```sh
sudo vi /usr/lib/systemd/system/jenkins.service
```

```
# Port to listen on for HTTP requests. Set to -1 to disable.
# To be able to listen on privileged ports (port numbers less than 1024),
# add the CAP_NET_BIND_SERVICE capability to the AmbientCapabilities
# directive below.
Environment="JENKINS_PORT=8000"
```

## 실행

```sh
sudo systemctl start jenkins
```