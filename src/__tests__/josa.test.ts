import { describe, expect, it } from "vitest";
import { withJosa } from "@/lib/format";

/** 작물·지역 이름을 문구에 끼워 넣을 때 "감을(를)" 같은 표기가 나오면 안 된다 */
describe("withJosa", () => {
  it("받침이 있으면 을·이·은·과", () => {
    expect(withJosa("감", "을")).toBe("감을");
    expect(withJosa("감", "이")).toBe("감이");
    expect(withJosa("당근", "은")).toBe("당근은");
    expect(withJosa("복숭아밭", "과")).toBe("복숭아밭과");
  });

  it("받침이 없으면 를·가·는·와", () => {
    expect(withJosa("사과", "을")).toBe("사과를");
    expect(withJosa("배", "이")).toBe("배가");
    expect(withJosa("参깨".replace("参", "참"), "은")).toBe("참깨는");
    expect(withJosa("감자", "과")).toBe("감자와");
  });

  it("짝을 어느 쪽으로 넘겨도 결과가 같다", () => {
    expect(withJosa("감", "를")).toBe(withJosa("감", "을"));
    expect(withJosa("사과", "가")).toBe(withJosa("사과", "이"));
  });

  it("한글이 아닌 끝 글자는 받침 없는 쪽", () => {
    expect(withJosa("GAP", "을")).toBe("GAP를");
    expect(withJosa("", "을")).toBe("를");
  });

  it("모르는 조사는 그대로 붙인다", () => {
    expect(withJosa("감", "도")).toBe("감도");
  });
});
