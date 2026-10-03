/**
 * 참조선 끝 라벨 — 가로 참조선의 오른쪽 끝 바깥 여백에 두 줄(제목 / 값)로 쓴다 (10/3 QA).
 *
 * `label={{ position: "right" }}` 한 줄 라벨("평균 43,028")은 차트 오른쪽 여백(12px)을 넘어 SVG 밖으로
 * 잘렸다(/stats 귀산촌 45px·청년 40px, 시·군·구 "5년 평균" 27px — 375·1280 모두). 여백을 한 줄 길이만큼 넓히면
 * 모바일 그림 폭이 20% 가까이 줄고, 라벨을 그림 안으로 넣으면 데이터에 따라 막대와 겹친다.
 * 두 줄이면 값 길이(≈30px)만큼만 있으면 되고, 선 끝 바깥이라 데이터가 바뀌어도 막대·추세선과 겹치지 않는다.
 *
 * 쓰는 법: `label={<RefLineEndLabel above="평균" below="43,028" />}` + 차트 `margin.right = REF_LINE_LABEL_GUTTER`.
 * Recharts 가 이 요소를 복제하며 `viewBox`(선의 x·y·width)를 덧붙인다.
 */

/** 라벨이 들어갈 오른쪽 여백(px) — 간격 7 + 10px 글자 최장 "5년 평균"(≈34px) + 여유 */
export const REF_LINE_LABEL_GUTTER = 44;

/** 흰 카드 위 4.83:1 (예전 #9ca3af 는 2.54:1 로 글자 대비 미달) */
const LABEL_COLOR = "#6b7280";

interface Props {
  /** 선 위 줄 — "평균" */
  above: string;
  /** 선 아래 줄 — 값 "43,028" */
  below: string;
  /** Recharts 주입 — 참조선의 시작 x·y 와 길이 */
  viewBox?: { x?: number; y?: number; width?: number };
}

export function RefLineEndLabel({ above, below, viewBox }: Props) {
  if (viewBox?.x == null || viewBox.y == null) return null;
  // 선 끝에서 7px — 면적 차트는 마지막 점(r 5 + 테두리)이 선 끝에 걸려 5px 이면 글자와 붙는다
  const x = viewBox.x + (viewBox.width ?? 0) + 7;
  return (
    <text x={x} y={viewBox.y} fontSize={10} fill={LABEL_COLOR}>
      <tspan x={x} dy="-0.4em">
        {above}
      </tspan>
      <tspan x={x} dy="1.35em">
        {below}
      </tspan>
    </text>
  );
}
