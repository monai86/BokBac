import type { RankedSpecies } from '@/lib/types'
import { ConfidenceBadge } from './ConfidenceBadge'

const CONFIDENCE_EXPLANATION = {
  high: 'Findings are consistent and separated from the runner-up. Still educational, not definitive.',
  medium: 'Several findings support this candidate, but more confirmation would improve confidence.',
  low: 'The ranking is plausible but based on limited, weak, or mixed evidence.',
  very_low: 'Evidence is insufficient or contradictory. Treat this as an exploratory lead.',
} as const

function evidenceByTest(species: RankedSpecies | undefined) {
  return new Map((species?._evidence || []).map((item) => [item.test, item]))
}

function getSourceLabel(source: string, note?: string) {
  if (source === 'mcm') return 'อ้างอิงจากฐานข้อมูล MCM'
  if (source === 'library' && note === 'Group default') return 'ค่าพื้นฐานของกลุ่ม'
  if (source === 'library') return 'ข้อมูลทั่วไป (Library Fallback)'
  if (source === 'missing') return 'ไม่มีข้อมูลอ้างอิง'
  return source
}

function formatImpact(impact: number) {
  if (Math.abs(impact) < 0.01) return 'neutral'
  return impact > 0 ? `+${impact.toFixed(2)}` : impact.toFixed(2)
}

function EvidenceItem({ item }: { item: RankedSpecies['_evidence'][number] }) {
  const isPositive = item.direction === 'supportive'
  const bg = isPositive ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)'
  const border = isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'
  const badgeBg = isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
  const badgeText = isPositive ? '#34d399' : '#f87171'
  
  return (
    <li style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: '12px',
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      transition: 'all 0.2s',
    }} className="hover:brightness-110">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
          🧪 {item.test} = <strong style={{ color: isPositive ? '#34d399' : '#f59e0b' }}>{item.answer}</strong>
        </span>
        <span style={{
          background: badgeBg,
          color: badgeText,
          border: `1px solid ${border}`,
          borderRadius: '20px',
          padding: '2px 8px',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.5px'
        }}>
          {isPositive ? '📈 สนับสนุน' : '📉 ขัดแย้ง'} ({formatImpact(item.impact)})
        </span>
      </div>
      <p style={{ fontSize: '11px', color: 'var(--text3)', margin: 0, lineHeight: '1.4' }}>
        {getSourceLabel(item.source, item.note)}
        {typeof item.expectedPct === 'number' ? ` · ความสอดคล้องในฐานข้อมูล ${item.expectedPct}%` : ''}
        {item.isKey ? ' · คีย์จำแนกสำคัญ' : ''}
      </p>
    </li>
  )
}

export function ResultExplanation({
  results,
  answeredCount,
}: {
  results: RankedSpecies[]
  answeredCount: number
}) {
  const top = results[0]
  if (!top || top._excluded) return null

  const runnerUp = results.find((r, i) => i > 0 && !r._excluded)
  const excludedCount = results.filter((r) => r._excluded).length
  const contradictionCount = top.contradictionCount ?? 0
  const gap = top._gap ?? (runnerUp ? top.pct - runnerUp.pct : top.pct)
  const mcmLabel = top._mcm
    ? `ใช้ ${top._usedMcmTests} MCM tests`
    : 'ไม่มีข้อมูล MCM (Fallback)'
    
  const answerLabel =
    answeredCount === 0
      ? 'ยังไม่มีการกรอกผลทดสอบทางชีวเคมี; การจัดอันดับปัจจุบันมาจากค่าความชุก (Prevalence prior)'
      : `พิจารณาจาก ${answeredCount} การทดสอบ`

  const supportiveEvidence = top._evidence
    .filter((item) => item.direction === 'supportive')
    .sort((a, b) => Math.abs(a.impact) - Math.abs(b.impact))
    .reverse()
    .slice(0, 4)

  const conflictingEvidence = top._evidence
    .filter((item) => item.direction === 'conflicting')
    .sort((a, b) => Math.abs(a.impact) - Math.abs(b.impact))
    .reverse()
    .slice(0, 4)

  const missingEvidence = top._evidence
    .filter((item) => item.source === 'missing')
    .slice(0, 4)

  const neutralKeyEvidence = top._evidence
    .filter((item) => item.direction === 'neutral' && item.isKey && item.source !== 'missing')
    .slice(0, 3)

  const runnerEvidence = evidenceByTest(runnerUp)
  const differentiators = top._evidence
    .map((item) => ({ top: item, runner: runnerEvidence.get(item.test) }))
    .filter(({ runner }) => runner && runner.direction !== 'neutral')
    .sort((a, b) => {
      const aDelta = Math.abs(a.top.impact - (a.runner?.impact || 0))
      const bDelta = Math.abs(b.top.impact - (b.runner?.impact || 0))
      return bDelta - aDelta
    })
    .slice(0, 3)

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Educational Notice Banner */}
      <div style={{
        background: 'rgba(56, 189, 248, 0.05)',
        border: '1px solid rgba(56, 189, 248, 0.15)',
        borderRadius: '12px',
        padding: '14px 18px',
        fontSize: '13px',
        color: '#bae6fd',
        lineHeight: '1.5',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
      }}>
        <span style={{ fontSize: '18px', lineHeight: '1' }}>💡</span>
        <div>
          <strong style={{ color: '#fff', display: 'block', marginBottom: '2px' }}>คำแนะนำเพื่อการเรียนรู้ (Educational Support)</strong>
          <span className="sr-only">BokBac is for educational bacterial identification support only.</span>
          BokBac เป็นระบบช่วยจำแนกชนิดแบคทีเรียเพื่อการเรียนการสอนเท่านั้น ค่าระดับความน่าเชื่อถือสะท้อนถึงความสอดคล้องกับข้อมูลอ้างอิง ไม่ใช่การยืนยันทางคลินิก การวิเคราะห์ทางห้องปฏิบัติการเพื่อยืนยันผลยังคงเป็นสิ่งจำเป็นเสมอ
        </div>
      </div>

      {/* Main Ranking Rationale Hero Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.4) 0%, rgba(17, 24, 39, 0.6) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div style={{ flex: 1 }}>
            <span className="sr-only">Why this is the current most likely match</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>
              📊 วิเคราะห์ผลอันดับสูงสุด (TOP IDENTIFICATION MATCH)
            </span>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: '0 0 8px 0', letterSpacing: '-0.5px', fontFamily: "var(--font-serif-header), serif" }}>
              <em>{top.name}</em>
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text2)', margin: '0 0 12px 0', lineHeight: '1.6' }}>
              เป็นเชื้อที่สอดคล้องมากที่สุดในขณะนี้ โดยมีระดับความน่าเชื่อถือภายในกลุ่ม {Math.round(top.posteriorWithinCandidateSet ?? top.pct)}% ({answerLabel})
            </p>
            {top._confidence && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'var(--text3)', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span>🛡️</span>
                <span><strong>ระดับความมั่นใจ:</strong> {CONFIDENCE_EXPLANATION[top._confidence]}</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '120px' }}>
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
              border: '4px solid var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(167, 139, 250, 0.2)',
              marginBottom: '10px'
            }}>
              <span style={{ fontSize: '26px', fontWeight: 800, color: '#fff' }}>
                {Math.round(top.posteriorWithinCandidateSet ?? top.pct)}%
              </span>
            </div>
            {top._confidence && <ConfidenceBadge level={top._confidence} />}
          </div>
        </div>
      </div>

      {/* Metrics Dashboard Grid */}
      <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', margin: 0 }}>
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px',
          padding: '16px',
          transition: 'all 0.2s',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }} className="hover:bg-white/[0.04] hover:border-white/10">
          <dt style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            📖 แหล่งข้อมูล (SOURCE)
          </dt>
          <dd style={{ fontSize: '15px', fontWeight: 600, color: '#fff', margin: 0 }}>
            {mcmLabel}
          </dd>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px',
          padding: '16px',
          transition: 'all 0.2s',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }} className="hover:bg-white/[0.04] hover:border-white/10">
          <dt style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            ⚡ นำอันดับสองอยู่ (RUNNER-UP GAP)
          </dt>
          <dd style={{ fontSize: '14px', fontWeight: 600, color: '#fff', margin: 0 }}>
            {Math.round(gap)}% {runnerUp ? <>เหนือ <em>{runnerUp.name}</em></> : ''}
          </dd>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px',
          padding: '16px',
          transition: 'all 0.2s',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }} className="hover:bg-white/[0.04] hover:border-white/10">
          <dt style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            🔑 การทดสอบหลัก (KEY TESTS)
          </dt>
          <dd style={{ fontSize: '15px', fontWeight: 600, color: '#fff', margin: 0 }}>
            สอดคล้อง {top._keyMatch} / ขัดแย้ง {top._keyMismatch}
          </dd>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px',
          padding: '16px',
          transition: 'all 0.2s',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }} className="hover:bg-white/[0.04] hover:border-white/10">
          <dt style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            🚫 ถูกคัดออก (RULED OUT)
          </dt>
          <dd style={{ fontSize: '15px', fontWeight: 600, color: '#fff', margin: 0 }}>
            {excludedCount} สายพันธุ์
          </dd>
        </div>
        {top.caseFitScore !== undefined && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            padding: '16px',
            transition: 'all 0.2s',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }} className="hover:bg-white/[0.04] hover:border-white/10">
            <dt style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              🎯 CASE FIT
            </dt>
            <dd style={{ fontSize: '15px', fontWeight: 600, color: '#fff', margin: 0 }}>
              {Math.round(top.caseFitScore * 100)}%
            </dd>
          </div>
        )}
      </dl>

      {/* Warning Alert Banner */}
      {(answeredCount === 0 || top.evidenceCoverage < 0.5 || contradictionCount > 0 || conflictingEvidence.length > 0) && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.05)',
          border: '1px solid rgba(245, 158, 11, 0.15)',
          borderRadius: '12px',
          padding: '14px 18px',
          fontSize: '12px',
          color: '#fef3c7',
          lineHeight: '1.6',
          display: 'flex',
          gap: '10px',
        }}>
          <span style={{ fontSize: '16px' }}>⚠️</span>
          <div>
            {answeredCount === 0 && <p style={{ margin: 0 }}><strong>ยังไม่มีการกรอกผลทดสอบ:</strong> อันดับของเชื้อมาจากการประมาณค่าความชุกเบื้องต้น (Prevalence prior) กรุณากรอกผลการทดสอบ biochemical ในขั้นตอนที่ 2 ก่อนนำไปวิเคราะห์ผลละเอียด</p>}
            {answeredCount > 0 && top.evidenceCoverage < 0.5 && <p style={{ margin: 0 }}><strong>ข้อมูลอ้างอิงมีจำกัด:</strong> การทดสอบที่กรอกหลายตัวไม่มีข้อมูลสถิติอ้างอิงสำหรับสายพันธุ์นี้ ควรทำการทดสอบมาตรฐานเพิ่มเติมนอก suite นี้หากเป็นไปได้</p>}
            {contradictionCount > 0 && <p style={{ margin: 0 }}><strong>ตรวจพบข้อขัดแย้ง:</strong> พบจุดขัดแย้งกับข้อมูลอ้างอิงในระบบอย่างน้อย {contradictionCount} จุด กรุณาตรวจสอบผลการทดสอบอีกครั้ง</p>}
            {conflictingEvidence.length > 0 && <p style={{ margin: 0 }}><strong>มีผลขัดแย้ง:</strong> มีผลการทดสอบบางตัวที่ค้านกับการจัดอันดับเชื้อนี้ (ความน่าจะเป็นลดลง) ควรศึกษาลักษณะเด่นอื่นๆ เพิ่มเติม</p>}
          </div>
        </div>
      )}

      {/* Evidence Summary Lists */}
      {(supportiveEvidence.length > 0 || conflictingEvidence.length > 0 || missingEvidence.length > 0 || neutralKeyEvidence.length > 0) && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
          <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
            <span className="sr-only">Evidence summary</span>
            📊 สรุปหลักฐานสนับสนุนและคัดค้าน (EVIDENCE SUMMARY)
          </h4>
          <div className="grid gap-4 lg:grid-cols-2">
            <section>
              <h5 style={{ fontSize: '13px', fontWeight: 700, color: '#34d399', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🟢</span> ผลสนับสนุนการจัดอันดับ (Increased probability)
              </h5>
              {supportiveEvidence.length > 0 ? (
                <ul className="space-y-2 pl-0 list-none">
                  {supportiveEvidence.map((item) => <EvidenceItem key={`${item.test}-${item.answer}-support`} item={item} />)}
                </ul>
              ) : (
                <p style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', fontSize: '12px', color: 'var(--text3)', textAlign: 'center', margin: 0 }}>
                  ยังไม่มีการกรอกผลทดสอบที่สนับสนุนสายพันธุ์นี้เป็นพิเศษ
                </p>
              )}
            </section>

            <section>
              <h5 style={{ fontSize: '13px', fontWeight: 700, color: '#f87171', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🔴</span> ผลขัดแย้งกับการจัดอันดับ (Decreased probability)
              </h5>
              {conflictingEvidence.length > 0 ? (
                <ul className="space-y-2 pl-0 list-none">
                  {conflictingEvidence.map((item) => <EvidenceItem key={`${item.test}-${item.answer}-conflict`} item={item} />)}
                </ul>
              ) : (
                <p style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', fontSize: '12px', color: 'var(--text3)', textAlign: 'center', margin: 0 }}>
                  ไม่พบผลการทดสอบที่ขัดแย้งรุนแรงกับสายพันธุ์นี้
                </p>
              )}
            </section>
          </div>

          {(missingEvidence.length > 0 || neutralKeyEvidence.length > 0) && (
            <div style={{
              marginTop: '16px',
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: '12px',
              padding: '14px 18px',
              fontSize: '12px',
              color: 'var(--text3)',
              lineHeight: '1.6'
            }}>
              {missingEvidence.length > 0 && (
                <p style={{ margin: 0 }}>
                  ⚠️ <strong>การทดสอบที่ไม่มีสถิติอ้างอิง:</strong> {missingEvidence.map((item) => item.test).join(', ')} (ค่าเหล่านี้จะไม่ส่งผลดันอันดับขึ้นหรือลงเนื่องจากไม่มีข้อมูล Positivity ในระบบ)
                </p>
              )}
              {neutralKeyEvidence.length > 0 && (
                <p style={{ margin: missingEvidence.length > 0 ? '8px 0 0 0' : 0 }}>
                  ℹ️ <strong>ข้อมูลคีย์หลักที่เป็นกลาง (Neutral key evidence):</strong> {neutralKeyEvidence.map((item) => `${item.test} = ${item.answer}`).join(', ')}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Key Differentiators Row Comparison */}
      {runnerUp && differentiators.length > 0 && (
        <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
          <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
            🔑 ข้อแตกต่างหลักที่ทำให้อันดับสูงกว่า {runnerUp.name} (KEY DIFFERENTIATORS)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {differentiators.map(({ top: topItem, runner }) => (
              <div
                key={`${topItem.test}-${runnerUp.id}`}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                    🧪 {topItem.test} = <strong>{topItem.answer}</strong>
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600 }}>ความแตกต่างสำคัญ</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: 'var(--text2)', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(167, 139, 250, 0.1)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(167, 139, 250, 0.15)' }}>
                    <span style={{ fontWeight: 600, color: '#c084fc' }}>{top.name}</span>
                    <span style={{ color: '#fff' }}>positivity ({(topItem.expectedPct ?? topItem.likelihood * 100).toFixed(0)}%)</span>
                  </div>
                  <span style={{ color: 'var(--text3)' }}>vs</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text2)' }}>{runnerUp.name}</span>
                    <span style={{ color: '#fff' }}>positivity ({runner ? (runner.expectedPct ?? runner.likelihood * 100).toFixed(0) : '0'}%)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
