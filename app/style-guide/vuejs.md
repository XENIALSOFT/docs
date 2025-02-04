---
outline: deep
---
# Vue.js 스타일 가이드

프로젝트에서 `Vue`를 사용한다면, `오류`, `불필요한 논쟁`, `안티패턴`을 피하기 위한 훌륭한 참고 자료입니다.
그러나, 모든 팀이나 프로젝트에 이상적인 스타일 가이드가 있다고 생각하지는 않으므로, `과거의 경험`, `주변 기술 스택`, `개인적인 가치`에 따라 의식적인 변형을 권장합니다.

## 우선 순위 A: 필수(오류방지)

이 규칙들은 오류를 방지하는 데 도움이 되므로, 반드시 숙지하고 따라야 합니다.
예외는 있을 수 있지만, 매우 드물어야 하며 `JavaScript`와 `Vue`에 대한 전문 지식을 가진 사람만이 만들어야 합니다.

### 멀티 워드 컴포넌트 이름 사용

사용자 컴포넌트 이름은 항상 멀티 워드여야 하며, 루트 `App` 컴포넌트는 제외합니다.
이는 모든 `HTML` 요소가 단어 하나로 구성되어 있으므로, 기존 및 미래의 `HTML` 요소와의 `충돌을 방지`합니다.

```vue
<!-- 사전 컴파일된 템플릿에서 -->
<TodoItem />
```

### 상세한 `prop` 정의 사용

커밋된 코드에서는 `prop` 정의가 가능한 한 상세해야 하며, 최소한 타입을 명시해야 합니다.

상세한 `prop` 정의는 두 가지 장점이 있습니다.

- 컴포넌트의 API를 문서화하여 컴포넌트의 사용 방법을 쉽게 파악할 수 있습니다.
- 개발 중에 `Vue`는 잘못된 형식의 `props`가 컴포넌트에 제공될 경우 경고를 표시하여 오류의 잠재적 원인을 잡을 수 있도록 도와줍니다.

```vue
<script setup lang="ts">
interface Props {
  foo: string;
  bar?: number;
};

const props = defineProps<Props>();
</script>
```

### `v-for`에 `key` 사용하기

컴포넌트 내에서 하위 트리의 내부 컴포넌트 상태를 유지하기 위해, `v-for`와 함께 `key`는 **`항상`** 필요합니다.
심지어 요소에 대해서도, 객체의 일관성과 같은 예측 가능한 동작을 유지하는 것이 좋은 관행입니다.

```vue
<template>
<ul>
  <li
    v-for="todo in todos"
    :key="todo.id"
  >
    {{ todo.text }}
  </li>
</ul>
</template>
```

### `v-if`와 `v-for`를 함께 사용하지 않기

**`v-for`가 있는 같은 요소에 `v-if`를 사용하지 마세요.**

이것이 유혹적일 수 있는 두 가지 일반적인 경우가 있습니다.

- 목록의 항목을 필터링하기 위해.
예: `v-for="user in users" v-if="user.isActive"`
이 경우에는 `users`를 새로운 계산된 속성으로 대체하여 필터링된 목록을 반환하도록 합니다.
- 목록이 숨겨져야 할 경우 목록을 렌더링하지 않기 위해.
예: `v-for="user in users" v-if="shouldShowUsers"`
이 경우에는 `v-if`를 컨테이너 요소로 이동시킵니다.

```vue
<template>
<ul>
  <li
    v-for="user in activeUsers"
    :key="user.id"
  >
    {{ user.name }}
  </li>
</ul>

<!-- 또는 -->

<ul>
  <template v-for="user in users" :key="user.id">
    <li v-if="user.isActive">
      {{ user.name }}
    </li>
  </template>
</ul>
</template>
```

### 컴포넌트 범위 스타일 사용하기

애플리케이션에서는 최상위 `App` 컴포넌트와 레이아웃 컴포넌트의 스타일이 전역적일 수 있지만, 다른 모든 컴포넌트는 항상 범위가 지정되어야 합니다.

이것은 싱글 파일 컴포넌트에만 관련이 있습니다. 이것은 `scoped` 속성을 사용해야 한다는 것을 의미하지는 않습니다.
범위 지정은 `CSS 모듈`, `BEM`과 같은 클래스 기반 전략 또는 다른 라이브러리 또는 관례를 통해 이루어질 수 있습니다.

```vue
<template>
  <button class="button button-close">×</button>
</template>

<!-- `scoped` 속성 사용하기 -->
<style scoped>
.button {
  border: none;
  border-radius: 2px;
}

.button-close {
  background-color: red;
}
</style>
```

```vue
<template>
  <button :class="[$style.button, $style.buttonClose]">×</button>
</template>

<!-- CSS 모듈 사용하기 -->
<style module>
.button {
  border: none;
  border-radius: 2px;
}

.buttonClose {
  background-color: red;
}
</style>
```

```vue
<template>
  <button class="c-Button c-Button--close">×</button>
</template>

<!-- BEM 관례 사용하기 -->
<style>
.c-Button {
  border: none;
  border-radius: 2px;
}

.c-Button--close {
  background-color: red;
}
</style>
```

## 우선 순위 B: 강력히 권장

이 규칙들은 대부분의 프로젝트에서 가독성과 개발자 경험을 향상시키는 것으로 밝혀졌습니다.
이 규칙들을 위반해도 코드는 여전히 실행될 것이지만, 위반은 드물고 잘 정당화되어야 합니다.

### 컴포넌트 파일

빌드 시스템에서 파일을 연결할 수 있는 경우 각 컴포넌트는 자체 파일에 있어야 합니다.

이렇게 하면 보통 컴포넌트를 편집하거나 사용 방법을 검토해야 할 때 더 빠르게 찾을 수 있습니다.

```
components/
|- TodoList.vue
|- TodoItem.vue
```

### 싱글 파일 컴포넌트 파일명 대/소문자

싱글 파일 컴포넌트의 파일명은 항상 파스칼 케이스여야 합니다.

파스칼 케이스는 코드 편집기의 자동 완성 기능에서 가장 잘 작동하며, 가능한 경우 JSX 및 템플릿에서 컴포넌트를 참조하는 방식과 일치하기 때문입니다.

```
components/
|- MyComponent.vue
```

### 긴밀하게 결합된 컴포넌트 이름

부모 컴포넌트와 긴밀하게 결합된 자식 컴포넌트는 부모 컴포넌트 이름을 접두사로 포함해야 합니다.

컴포넌트가 단일 상위 컴포넌트의 컨텍스트에서만 의미가 있는 경우, 그 관계가 이름에 명확히 드러나야 합니다.
편집기는 일반적으로 파일을 알파벳순으로 정리하므로 이렇게 하면 관련 파일이 서로 나란히 정렬됩니다.

```
components/
|- TodoList.vue
|- TodoListItem.vue
|- TodoListItemButton.vue

components/
|- SearchSidebar.vue
|- SearchSidebarNavigation.vue
```

:::tip
`Nuxt`에서는 폴더명이 자동으로 접두사로 붙지만 컴포넌트명과 일치하면 무시됩니다.
:::

### 컴포넌트 이름 내 단어 순서

컴포넌트 이름은 가장 높은 수준의 단어로 시작하고 설명적인 수정 단어로 끝나야 합니다.

컴포넌트에 이름에 자연스럽지 않은 언어를 사용될 수 있지만 일반적으로 파일을 알파벳 순으로 정리하기 때문에 컴포넌트 간의 모든 중요한 관계를 한 눈에 알 수 있습니다.

```
components/
|- SearchButtonClear.vue
|- SearchButtonRun.vue
|- SearchInputQuery.vue
|- SearchInputExcludeGlob.vue
|- SettingsCheckboxTerms.vue
|- SettingsCheckboxLaunchOnStartup.vue
```

### 셀프 클로징 컴포넌트

셀프 클로징 되는 컴포넌트는 콘텐츠가 없을 뿐만 아니라 콘텐츠가 없는 것으로 의미된다는 것을 알립니다.

```vue
<template>
  <!-- In Single-File Components, string templates, and JSX -->
  <MyComponent/>
</template>
```

### 전체 단어 컴포넌트 이름

컴포넌트 이름은 약어보다 완전한 단어를 사용하는 것이 좋습니다.

편집기의 자동 완성 기능은 긴 이름을 작성하는 데 드는 비용을 매우 낮춰주는 반면, 명확성을 제공하는 것은 매우 귀중합니다.
특히 흔하지 않은 약어는 항상 피해야 합니다.

```
아래처럼은 사용하면 안 됩니다.
components/
|- SdSettings.vue
|- UProfOpts.vue

아래처럼 사용해야 합니다.
components/
|- StudentDashboardSettings.vue
|- UserProfileOptions.vue
```

### `prop` 이름 대소문자

`prop` 이름은 선언 시 항상 대/소문자를 구분해야 합니다.
템플릿 내에서 사용하는 경우 `prop`은 `케밥 케이스`를 사용해야 합니다.

```vue
<script setup lang="ts">
interface Props {
  greetingText: string;
}

const props = defineProps<Props>();
</script>
```

```vue
<template>
  <WelcomeMessage greeting-text="hi"/>
</template>
```

### 다중 속성 엘리먼트

여러 속성을 가진 엘리먼트는 여러 줄에 걸쳐 있어야 하며, 한 줄당 하나의 속성을 사용해야 합니다.

자바스크립트에서는 여러 속성을 가진 객체를 여러 줄에 걸쳐 분할하는 것이 훨씬 읽기 쉽기 때문에
좋은 관습으로 널리 알려져 있습니다.

```vue
<template>
<img
  src="https://vuejs.org/images/logo.png"
  alt="Vue Logo"
>

<MyComponent
  foo="a"
  bar="b"
  baz="c"
/>
</template>
```

### 템플릿의 간단한 표현식

컴포넌트 템플릿에는 단순한 표현식만 포함해야 하며, 복잡한 표현식은 계산된 속성이나 메서드로 리팩토링해야 합니다.

템플릿에 복잡한 표현식이 있으면 선언적 표현이 줄어듭니다.
값을 계산하는 `방법`이 아니라 `무엇`이 표시되어야 하는지를 설명하기 위해 노력해야 합니다.
계산된 프로퍼티와 메서드는 코드를 재사용할 수 있게 해줍니다.

```vue
<template>
<!-- 아래와 같이 사용하면 안 됩니다. -->
{{
  fullName.split(' ').map((word) => {
    return word[0].toUpperCase() + word.slice(1)
  }).join(' ')
}}
</template>
```

```vue
<script setup lang="ts">
// The complex expression has been moved to a computed property
const normalizedFullName = computed(() =>
  fullName.value
    .split(' ')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
)
</script>

<template>
<!-- In a template -->
{{ normalizedFullName }}
</template>
```

### 단순 계산 프로퍼티

복잡한 계산 프로퍼티는 가능한 한 많은 단순한 프로퍼티로 분할해야 합니다.

아래와 같은 장점을 가집니다.

- 테스트하기 쉬움
  
  각 계산된 프로퍼티에 종속성이 거의 없는 매우 간단한 표현식만 포함되어 있으며 올바르게 작동하는지 확인하는 테스트를 작성하기 훨씬 쉽습니다.

- 읽기 쉬움

  계산된 프로퍼티를 단순화하면 재사용되지 않더라도 각 값에 설명이 포함된 이름을 지정할 수 있습니다.
  이렇게 하면 다른 개발자가 관심 있는 코드에 집중하고 무슨 일이 일어나고 있는지 파악하기 훨씬 쉬워집니다.

- 변화하는 요구 사항에 더 쉽게 적응

  이름을 지정할 수 있는 모든 값은 뷰에 유용할 수 있습니다.

```vue
<script setup lang="ts">
const basePrice = computed(() => manufactureCost.value / (1 - profitMargin.value));

const discount = computed(() => basePrice.value * (discountPercent.value || 0));

const finalPrice = computed(() => basePrice.value - discount.value)
</script>
```

## 우선 순위 C: 권장

여러 가지 동등하게 좋은 옵션이 존재할 때, 일관성을 유지하기 위해 임의적인 선택을 할 수 있습니다.
이 규칙에서는 각각의 허용 가능한 옵션을 설명하고 기본 선택을 제안합니다.
즉, 코드베이스에서 다른 선택을 자유롭게 할 수 있지만, 일관성을 유지하고 좋은 이유가 있어야 합니다.
하지만 좋은 이유가 있어야 합니다! 커뮤니티 표준에 적응함으로써 다음과 같은 이점이 있습니다.

- 대부분의 커뮤니티 코드를 더 쉽게 파악할 수 있도록 두뇌를 훈련시킵니다.
- 대부분의 커뮤니티 코드 예제를 수정 없이 복사 및 붙여넣을 수 있습니다.
- 새로운 직원이 이미 `Vue`에 관한 선호하는 코딩 스타일에 익숙할 가능성이 높습니다.

### 컴포넌트/인스턴스 옵션에서의 빈 줄

여러 줄로 된 속성 사이에 빈줄을 추가하고 싶을 수도 있습니다.
특히 옵션이 화면에 스크롤 없이 맞지 않을 경우에는 더욱 그렇습니다.

컴포넌트가 읽기 어렵거나 혼잡해질 때, 여러 줄로 된 속성 사이에 공간을 추가하면 다시 살펴보기 쉬워질 수 있습니다.
`Vim`과 같은 일부 편집기에서는 키보드로 탐색하기 쉽도록 이러한 형식의 옵션을 사용할 수도 있습니다.

```vue
<script setup lang="ts">
interface Prop {
  value: string;
  focused?: boolean;
  label?: string;
  icon?: string;
}

withDefaults(defineProps<Prop>(), {
  focused: false
});

const formattedValue = computed(() => {
  // ...
})

const inputClasses = computed(() => {
  // ...
})
</script>
```

### 싱글 파일 컴포넌트 최상위 요소 순서

`싱글 파일 컴포넌트`는 항상 `<script>`, `<template>`, `<style>` 태그를 일관되게 정렬해야 합니다.
`<style>`은 다른 두 태그 중 적어도 하나가 항상 필요하기 때문에 마지막에 와야 합니다.

```vue
<!-- ComponentA.vue -->
<script>/* ... */</script>
<template>...</template>
<style>/* ... */</style>

<!-- ComponentB.vue -->
<script>/* ... */</script>
<template>...</template>
<style>/* ... */</style>
```

## 우선 순위 D: 주의해서 사용하기

`Vue`의 일부 기능은 드문 `에지 케이스`나 `레거시 코드 베이스`에서의 부드러운 마이그레이션을 수용하기 위해 존재합니다.
그러나 과도하게 사용되면 코드를 유지 관리하기 어렵게 만들거나 버그의 원인이 될 수 있습니다. 이 규칙들은 잠재적으로 위험한 기능에 대해 조명을 비추고, 언제 그리고 왜 피해야 하는지 설명합니다.

### `scoped`에서의 요소 선택자

`scoped`에서는 요소 선택자를 피해야 합니다.

`scoped` 스타일에서는 요소 선택자보다 클래스 선택자를 선호합니다.
왜냐하면 많은 수의 요소 선택자는 처리 속도가 느리기 때문입니다.

스타일을 범위 지정하기 위해, `Vue`는 컴포넌트 요소에 고유한 속성을 추가합니다.
예를 들어, `data-v-f7dec8` 같은 것입니다. 그런 다음 선택자가 수정되어 이 속성을 가진 일치하는 요소만 선택되도록 합니다.
(예: `button[data-v-f7dec8]`)

문제는 많은 수의 요소-속성 선택자가 클래스-속성 선택자보다 상당히 느리다는 것이므로, 가능한 클래스 선택자를 선호해야 합니다.

```vue
<template>
  <button class="btn btn-close">×</button>
</template>

<style scoped>
.btn-close {
  background-color: red;
}

/* 아래와 같은 경우는 피해야 합니다. */
button {
  background-color: red;
}
</style>
```

### 암시적인 부모-자식 커뮤니케이션

부모-자식 컴포넌트 간의 커뮤니케이션은 `prop`을 변형하는 대신 `prop`과 이벤트를 선호해야 합니다.

이상적인 `Vue` 애플리케이션은 `prop`을 통해 아래로 전달하고, 이벤트를 통해 위로 전달합니다.
이 관계를 따르면 컴포넌트를 이해하기 훨씬 쉬워집니다. 그러나 `prop` 변형이 이미 깊게 결합된 두 컴포넌트를 단순화하는 `에지 케이스`가 있습니다.

문제는 이러한 패턴들이 편리함을 제공할 수 있는 많은 단순한 경우도 있다는 것입니다.
단기적인 편리함(더 적은 코드 작성)을 위해 단순함(상태의 흐름을 이해)을 희생하는 유혹에 빠지면 안 됩니다.

```vue
<script setup>
defineProps({
  todo: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['input'])
</script>

<template>
  <input :value="todo.text" @input="emit('input', $event.target.value)" />
</template>
```

```vue
<script setup>
defineProps({
  todo: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete'])
</script>

<template>
  <span>
    {{ todo.text }}
    <button @click="emit('delete')">×</button>
  </span>
</template>
```