---
next: false
outline: deep
---

# MariaDB 설정

## MariaDB의 `lower_case_table_names`

`lower_case_table_names`는 테이블 및 데이터베이스 이름의 대소문자 구분 방식을 제어하는 시스템 변수입니다.

운영체제(OS) 및 파일 시스템에 따라 MariaDB가 테이블과 데이터베이스 이름을 처리하는 방식을 결정합니다.

### 값과 동작 방식

MariaDB에서는 `lower_case_table_names` 변수를 3가지 값(0,1,2) 중 하나로 설정할 수 있습니다.

|값|설명|적용 대상|
|--|---|--------|
|0|대소문자를 구분함(대소문자 그대로 저장 & 비교)|리눅스(ext4, XFS 등 대소문자 구분하는 파일 시스템)|
|1|모든 테이블/DB 이름을 소문자로 변환하여 저장 및 비교(대소문자 구분 안 함)|윈도우, MacOS|
|2|대소문자 구분하여 저장하지만, 비교할 때는 대소문자를 구분하지 않음|일부 MacOS|

### 값에 따른 동작 예시

```sql
CREATE TABLE MyTable (id INT);
```

|설정 값|`SHOW TABLES` 결과|`select * from mytable;` 가능 여부|
|------|-----------------|----------------------------------|
|`0`(대소문자 구분)|`MyTable`|❌(`mytable`로 조회 시 오류 발생)|
|`1`(소문자로 저장)|`mybatle`|✅(`MyTable`, `mytable` 모두 조회 가능)|
|`1`(소문자로 비교)|`MyTable`|✅(`MyTable`, `mytable` 모두 조회 가능)|

### 변경 시 주의점

1. 운영체제(OS)와 파일 시스템 영향을 받음
    - 리눅스(Ubuntu, CentOS): 기본적으로 `lower_case_table_names=0` (대소문자 구분)
    - Windows/macOS: 기본적으로 `lower_case_table_names=1` (소문자로 저장)

2. 기존 데이터베이스에 적용하려면 직접 변경해야 함
    - `lower_case_table_names` 값은 데이터 디렉토리에 저장된 테이블 이름을 변경하지 않음
    - 기존 테이블 이름을 대소문자에 맞게 수동으로 변경해야 함

3. MariaDB를 실행하기 전에 설정해야 함
    - `lower_case_table_names` 값은 MariaDB가 시작될 때 결정되며, 실행 중에는 변경할 수 없음
    - 변경 후 MariaDB를 재시작해야 함

### 설정 및 변경 방법

1. 현재 설정 확인

```sql
SHOW VARIABLES LIKE 'lower_case_table_names';
```

2. `/etc/mysql/mariadb.conf.d/50-server.cnf` 에서 변경(MariaDB 재시작 필요)

```bash
sudo vi /etc/mysql/mariadb.conf.d/50-server.cnf
```

`[mysqld]` 섹션에 추가

```ini
[mysqld]
lower_case_table_names = 1
```

설정 적용 후 MariaDB를 재시작

```bash
sudo systemctl restart mariadb
```

3. 값 변경 후 테이블 이름 수동 변경(필요 시)

값을 변경한 후, 기존 테이블의 이름이 대소문자로 구분되어 있다면 `RENAME TABLE`을 사용하여 소문자로 변환해야 합니다.

```sql
rename table `MyTable` to `mytable`;
```

### 언제 어떤 설정을 사용해야 할까?

|환경|추천값|이유|
|---|------|---|
|리눅스 서버(Ubuntu, CentOS)에서 대소문자 구분 유지|`0`|파일 시스템이 대소문자 구분 가능|
|리눅스에서 Windows와 호환성 유지|`1`|Windows에서 `lower_case_table_names=1`이므로 동일하게 설정|
|Windows, macOS 사용|`1`(기본)|대소문자 구분 없이 사용 가능|
|macOS에서 기존 MySQL 데이터베이스 마이그레이션|`2`|일부 macOS 시스템과 호환|