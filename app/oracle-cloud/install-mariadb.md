# MariaDB 설치

## 수신 규칙 추가

1. `네트워킹` > `가상 클라우드 네트워크`에서 현재 생성된 `VCN`을 선택합니다.

2. `가상 클라우드 네트워크 세부정보`에서 `보안 목록`으로 들어가서 현재 생성된 보안 목록을 선택합니다.

3. `수신 규칙`을 추가합니다.

```text
소스 CIDR: 0.0.0.0/0
대상 포트 범위: 3306
설명: MariaDB
```

## MariaDB 설치

1. `콘솔`로 접속합니다.

2. `apt`를 최신화합니다.

```sh
sudo apt update
```

3. `MariaDB Server` 모듈 설치

```sh
sudo apt install mariadb-server
```

4. `MariaDB Client` 모듈 설치

```sh
sudo apt install mariadb-client
```

## MariaDB Secure 설정

`MariaDB` 서버의 보안을 강화하기 위한 명령어로, 처음 설치한 후 몇 가지 중요한 보안 설정을 수행하는 데 사용됩니다.

이 명령어는 `MariaDB`를 안전하게 설정하는 과정을 도와줍니다.

기본적으로 비밀번호 설정, 익명 사용자 제거, 원격 접속 제한, 테스트 데이터베이스 삭제 등을 처리하여 보안을 강화할 수 있습니다.

1. 루트 비밀번호 설정

`MariaDB`를 설치하고 처음 실행할 때, `root` 사용자 계정에 비밀번호를 설정하지 않았다면, `mysql_secure_installation`은 루트 비밀번호를 설정하도록 요청합니다. 이를 통해 루트 계정을 보호할 수 있습니다.

2. 익명 사용자 제거

기본적으로 `MariaDB`는 설치 시에 익명 사용자 계정을 생성합니다. 이는 보안상 위험을 초래할 수 있기 때문에 `mysql_secure_installation`은 익명 사용자 계정을 제거할지 묻습니다. 익명 사용자는 접근이 제한되도록 삭제하는 것이 좋습니다.

3. 루트 계정 원격 접속 비활성화

`MariaDB`의 `root` 계정을 기본적으로 로컬에서만 접속할 수 있도록 설정되어 있지 않을 수 있습니다.

이 명령은 `root` 계정의 원격 접속을 비활성화하여 보안을 강화할 수 있습니다. `root` 계정은 보통 로컬 머신에서만 접속할 수 있도록 설정하는 것이 좋습니다.

4. 기본 데이터베이스 테스트 제거

`MariaDB`에는 기본적으로 `test`라는 테스트용 데이터베이스가 설치됩니다. 이 데이터베이스는 보안상 불필요한 것이므로 `mysql_secure_installation`은 이를 제거할지 묻습니다. 이 테스트 데이터베이스를 제거하면 잠재적인 보안 위험을 줄일 수 있습니다.

```sh
sudo mysql_secure_installation

NOTE: RUNNING ALL PARTS OF THIS SCRIPT IS RECOMMENDED FOR ALL MariaDB
      SERVERS IN PRODUCTION USE!  PLEASE READ EACH STEP CAREFULLY!

In order to log into MariaDB to secure it, we'll need the current
password for the root user. If you've just installed MariaDB, and
haven't set the root password yet, you should just press enter here.

Enter current password for root (enter for none):
OK, successfully used password, moving on...

Setting the root password or using the unix_socket ensures that nobody
can log into the MariaDB root user without the proper authorisation.

You already have your root account protected, so you can safely answer 'n'.

Switch to unix_socket authentication [Y/n] n
 ... skipping.

You already have your root account protected, so you can safely answer 'n'.

Change the root password? [Y/n] y
New password:
Re-enter new password:
Password updated successfully!
Reloading privilege tables..
 ... Success!


By default, a MariaDB installation has an anonymous user, allowing anyone
to log into MariaDB without having to have a user account created for
them.  This is intended only for testing, and to make the installation
go a bit smoother.  You should remove them before moving into a
production environment.

Remove anonymous users? [Y/n] y
 ... Success!

Normally, root should only be allowed to connect from 'localhost'.  This
ensures that someone cannot guess at the root password from the network.

Disallow root login remotely? [Y/n] y
 ... Success!

By default, MariaDB comes with a database named 'test' that anyone can
access.  This is also intended only for testing, and should be removed
before moving into a production environment.

Remove test database and access to it? [Y/n] y
 - Dropping test database...
 ... Success!
 - Removing privileges on test database...
 ... Success!

Reloading the privilege tables will ensure that all changes made so far
will take effect immediately.

Reload privilege tables now? [Y/n] y
 ... Success!

Cleaning up...

All done!  If you've completed all of the above steps, your MariaDB
installation should now be secure.

Thanks for using MariaDB!
```

## MariaDB 접속

```sh
mysql -u root -p
```

## MariaDB 버전 확인

```sql
select version();
```

```
+----------------------------------+
| version()                        |
+----------------------------------+
| 10.11.8-MariaDB-0ubuntu0.24.04.1 |
+----------------------------------+
1 row in set (0.000 sec)
```

## MariaDB 상태 확인

```sh
service mysql status
```

```sh
● mariadb.service - MariaDB 10.11.8 database server
     Loaded: loaded (/usr/lib/systemd/system/mariadb.service; enabled; preset: enabled)
     Active: active (running) since Mon 2025-02-03 15:35:14 UTC; 19min ago
       Docs: man:mariadbd(8)
             https://mariadb.com/kb/en/library/systemd/
    Process: 5355 ExecStartPre=/usr/bin/install -m 755 -o mysql -g root -d /var/run/mysqld (code=exited, status=0/SUCCESS)
    Process: 5357 ExecStartPre=/bin/sh -c systemctl unset-environment _WSREP_START_POSITION (code=exited, status=0/SUCCESS)
    Process: 5359 ExecStartPre=/bin/sh -c [ ! -e /usr/bin/galera_recovery ] && VAR= ||   VAR=`cd /usr/bin/..; /usr/bin/galera_recovery`; [ $? -eq 0 ]   &>
    Process: 5435 ExecStartPost=/bin/sh -c systemctl unset-environment _WSREP_START_POSITION (code=exited, status=0/SUCCESS)
    Process: 5437 ExecStartPost=/etc/mysql/debian-start (code=exited, status=0/SUCCESS)
   Main PID: 5423 (mariadbd)
     Status: "Taking your SQL requests now..."
      Tasks: 12 (limit: 7173)
     Memory: 79.6M (peak: 81.7M)
        CPU: 1.517s
     CGroup: /system.slice/mariadb.service
             └─5423 /usr/sbin/mariadbd
```

## MariaDB Database 생성

```sql
create database xenialsoft;
```

## MariaDB 외부 접속

```sql
-- '%' => 외부 접속

-- 계정 생성이 필요한 경우
create user '계정'@'%' identified by '비밀번호';

-- 권한 설정
grant all privileges on xenialsoft.* to '계정'@'%';
```

## MariaDB PORT 설정

```sh
sudo vi /etc/mysql/my.cnf
```

`PORT` 부분의 주석을 해제한다.

```sh
# The MariaDB configuration file
#
# The MariaDB/MySQL tools read configuration files in the following order:
# 0. "/etc/mysql/my.cnf" symlinks to this file, reason why all the rest is read.
# 1. "/etc/mysql/mariadb.cnf" (this file) to set global defaults,
# 2. "/etc/mysql/conf.d/*.cnf" to set global options.
# 3. "/etc/mysql/mariadb.conf.d/*.cnf" to set MariaDB-only options.
# 4. "~/.my.cnf" to set user-specific options.
#
# If the same option is defined multiple times, the last one will apply.
#
# One can use all long options that the program supports.
# Run program with --help to get a list of available options and with
# --print-defaults to see which it would actually understand and use.
#
# If you are new to MariaDB, check out https://mariadb.com/kb/en/basic-mariadb-articles/

#
# This group is read both by the client and the server
# use it for options that affect everything
#
[client-server]
# Port or socket location where to connect
port = 3306
socket = /run/mysqld/mysqld.sock

# Import all .cnf files from configuration directory
!includedir /etc/mysql/conf.d/
!includedir /etc/mysql/mariadb.conf.d/
```

## MariaDB IP 설정

```sh
sudo vi /etc/mysql/mariadb.conf.d/50-server.cnf
```

`IP` 부분의 값을 `0.0.0.0`으로 수정한다.

```sh
#
# These groups are read by MariaDB server.
# Use it for options that only the server (but not clients) should see

# this is read by the standalone daemon and embedded servers
[server]

# this is only for the mysqld standalone daemon
[mysqld]

#
# * Basic Settings
#

#user                    = mysql
pid-file                = /run/mysqld/mysqld.pid
basedir                 = /usr
#datadir                 = /var/lib/mysql
#tmpdir                  = /tmp

# Broken reverse DNS slows down connections considerably and name resolve is
# safe to skip if there are no "host by domain name" access grants
#skip-name-resolve

# Instead of skip-networking the default is now to listen only on
# localhost which is more compatible and is not less secure.
bind-address            = 0.0.0.0

... 중략
```

## MariaDB 인바운드 규칙 추가

`iptables` 명령어를 통해 인바운드 규칙을 추가해줍니다.

여기서 `ens3`는 네트워크 인터페이스입니다.

```sh
sudo iptables -I INPUT 5 -i ens3 -p tcp --dport 3306 -m state --state NEW,ESTABLISHED -j ACCEPT
```

`iptables`의 목록 중 `mysql`에 대한 인바운드 규칙이 추가된 것을 확인할 수 있습니다.

```
ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:mysql state NEW,ESTABLISHED
```

## DBeaver로 MariaDB 연결

`Server Host`에는 인스턴스의 `퍼블릭 IP`를, `Database`에는 생성한 `xenialsoft`를, 그리고 계정 정보를 입력하고 `Test Connection`으로 연결 테스트를 해봅니다.