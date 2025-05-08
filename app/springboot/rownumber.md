# 순번 설정하기

목록 조회 시 순번(예: 1, 2, 3...)을 표시하는 가장 대중적인 방법은 DTO에서 계산하는 방식입니다.

엔티티에는 순번 필드를 추가하지 않고, 페이지 번호와 페이지 크기를 바탕으로 DTO에 순번을 매기는 방식이 일반적이고 추천됩니다.

## 이유

1. 순번은 DB에 저장되는 값이 아닙니다.
    - 순번은 화면 표시용 UI 데이터이므로 엔티티의 고유 속성으로 보기 어렵습니다.

2. 비즈니스 로직이나 DB 정합성과 무관한 값입니다.
    - 순번은 정렬 방식이나 페이지 번호에 따라 언제든 달라질 수 있는 파생 정보입니다.
    
3. 엔티티를 순수하게 유지할 수 있습니다.
    - 엔티티는 DB 매핑에 집중시키고, 화면용 데이터는 DTO에서 처리하는 것이 유지보수에 좋습니다.

## 어디에서?

순번을 계산하는 과정은 서비스 계층에서 수행하는 것이 가장 적절합니다.

왜냐하면 순번은 UI에 필요한 데이터이지만 단순한 출력이 아닌 로직 처리 결과이기 때문에 서비스가 적절합니다.
또한 컨트롤러는 요청-응답만 담당하고, 내부 로직은 서비스에 위임하는 것이 이상적인 계층 분리입니다.
서비스 계층에 있으면 추후 다른 API에서도 이 순번 로직을 재사용하거나 단위 테스트에 유리합니다.
DTO 조립(데이터와 추가 정보)은 대부분 서비스에서 이루어지므로 일관성 측면에서도 맞습니다.

## 공통 모델

`rowNumber` 와 같은 필드를 가진 공통 인터페이스를 정의하고 해당 인터페이스를 구현한 DTO에 대해 순번을 자동으로 부여하는 유틸리티 메서드를 만드는 것은 중복 제거와 코드 일관성, 유지보수성 면에서 좋습니다.

```java
public interface RowNumberSupport {
  void setRowNumber(int rowNumber);  
}
```

```java
@Getter
public class MyDto implements RowNumberSupport {
  private int rowNumber;
  private String name;

  @Override
  public void setRowNumber(int rowNumber) {
      this.rowNumber = rowNumber;
  }
}
```

## 유틸리티

```java
public class RowNumberUtils {

    public static <T extends RowNumberSupport> List<T> apply(List<T> items) {
        return apply(items, 1, false);
    }

    public static <T extends RowNumberSupport> List<T> apply(List<T> items, long start) {
        return apply(items, start, false);
    }

    public static <T extends RowNumberSupport> List<T> apply(List<T> items, long start, boolean descending) {
        if (items == null || items.isEmpty()) return items;

        for (T item : items) {
            item.setRowNumber(start);
            start = descending ? start - 1 : start + 1;
        }

        return items;
    }
}
```

조금 더 명확한 메서드로 하고 싶다면 `applyRowNumber`로 하는 것도 권장됩니다.