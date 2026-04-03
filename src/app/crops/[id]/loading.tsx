import s from "./loading.module.css";

export default function CropDetailLoading() {
  return (
    <div className={s.page}>
      <div className={s.backBtn} />

      {/* Hero */}
      <div className={s.hero}>
        <div className={s.heroImage} />
        <div className={s.heroInfo}>
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <div className={s.skeletonRound} style={{ width: 64, height: 28 }} />
              <div className={s.skeletonRound} style={{ width: 96, height: 28 }} />
            </div>
            <div className={s.skeleton} style={{ width: 200, height: 40, marginBottom: 14 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div className={s.skeleton} style={{ width: "100%", height: 18 }} />
              <div className={s.skeleton} style={{ width: "80%", height: 18 }} />
            </div>
          </div>
          <div className={s.factsRow}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={s.factBox}>
                <div className={s.skeleton} style={{ width: 72, height: 14 }} />
                <div className={s.skeleton} style={{ width: 100, height: 20 }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div className={s.skeleton} style={{ width: 160, height: 40, borderRadius: 8 }} />
            <div className={s.skeleton} style={{ width: 120, height: 40, borderRadius: 8 }} />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className={s.mainGrid}>
        <div className={s.mainContent}>
          {/* Cultivation */}
          <div className={s.section}>
            <div className={s.sectionTitle} />
            <div className={s.gridRow}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className={s.gridItem}>
                  <div className={s.gridItemIcon} />
                  <div className={s.gridItemText}>
                    <div className={s.skeleton} style={{ width: 48, height: 14 }} />
                    <div className={s.skeleton} style={{ width: "100%", height: 18 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Income */}
          <div className={s.section}>
            <div className={s.sectionTitle} />
            <div className={s.revenueBox}>
              <div className={s.skeleton} style={{ width: 120, height: 16, background: "rgba(0,0,0,0.06)" }} />
              <div className={s.skeleton} style={{ width: 200, height: 36, background: "rgba(0,0,0,0.06)" }} />
            </div>
            <div className={s.gridRow}>
              {[0, 1].map((i) => (
                <div key={i} className={s.gridItem}>
                  <div className={s.gridItemIcon} />
                  <div className={s.gridItemText}>
                    <div className={s.skeleton} style={{ width: 48, height: 14 }} />
                    <div className={s.skeleton} style={{ width: "100%", height: 18 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Region */}
          <div className={s.section}>
            <div className={s.sectionTitle} />
            <div className={s.badgeRow}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={s.skeletonRound} style={{ width: 72, height: 32 }} />
              ))}
            </div>
            <div className={s.regionBar}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className={s.regionBarItem}>
                  <div className={s.regionBarMeta}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div className={s.skeletonCircle} style={{ width: 30, height: 30 }} />
                      <div className={s.skeleton} style={{ width: 72, height: 18 }} />
                    </div>
                    <div className={s.skeleton} style={{ width: 64, height: 18 }} />
                  </div>
                  <div className={s.skeleton} style={{ width: "100%", height: 10, borderRadius: 5 }} />
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className={s.section}>
            <div className={s.sectionTitle} />
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} className={s.tipRow}>
                  <div className={s.skeletonCircle} style={{ width: 36, height: 36, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div className={s.skeleton} style={{ width: "100%", height: 18 }} />
                    <div className={s.skeleton} style={{ width: "70%", height: 18 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={s.sidebar}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={s.section}>
              <div className={s.sectionTitle} style={{ width: 100 }} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[0, 1, 2].map((j) => (
                  <div key={j} className={s.skeleton} style={{ width: 80, height: 32, borderRadius: 8 }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
