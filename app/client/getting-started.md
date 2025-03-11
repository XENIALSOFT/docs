# 시작하기

## 윈도우에서 키에 대한 권한 재조정

`scp` 등에서 `Bad permissions` 오류가 발생하면, 관리자 권한으로 `PowerShell`을 열어 아래 명령어로 권한을 재조정합니다.

```bash
icacls [키파일] /inheritance:r
# 사용자명은 whoami로 알 수 있음
icacls [키파일] /grant:r "사용자명:R"
```

