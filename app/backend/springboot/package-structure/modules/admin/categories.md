# 카테고리

## 필드

- 카테고리 식별자
  - id
  - char(10)
  - nanoid
- 카테고리 타입
  - type
  - varchar(30)
  - 기존에는 상품 카테고리에 국한된 카테고리를 범용적인 카테고리로 분리시킨다. 때문에 상품인 경우는 'product', 전후사진에 대해서는 '???' 이런식이다. 필수값으로 설정해야한다.
- 카테고리명
  - name
  - varchar(50)
- 설명
  - description
  - varchar(255)
- 화면표시순서
  - displayOrder
  - int
- 등록 일시
- 등록자
- 수정 일시
- 수정자