export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl p-6 sm:p-8 text-zinc-300">
      <h1 className="text-2xl font-bold text-zinc-50 mb-4">เกี่ยวกับแอป</h1>

      <div className="lg-surface p-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong className="text-zinc-100">Microbial World</strong> เป็น web application
          สำหรับช่วยวินิจฉัยเชื้อแบคทีเรียทางคลินิกแบบ AI-Assisted, Human-Guided
          ใช้ Naive Bayesian Probability Engine จากข้อมูลใน{' '}
          <em className="text-violet-300">Manual of Clinical Microbiology, 11th Edition (2015)</em>
        </p>

        <h2 className="text-base font-semibold text-zinc-100 pt-2">📊 ขอบเขต</h2>
        <ul className="list-disc list-inside space-y-1 text-zinc-400">
          <li>157 species ในฐานข้อมูล (93 species มีข้อมูล MCM biochemical % positivity)</li>
          <li>8 bacterial groups: Enterobacterales, NFB, Vibrio, GPC cluster/chain, GPB, GN coccobacilli</li>
          <li>50/50 textbook scenarios PASS (validation suite)</li>
          <li>33/33 Dichotomous Key concordance (100%)</li>
        </ul>

        <h2 className="text-base font-semibold text-zinc-100 pt-2">🧮 อัลกอริทึม</h2>
        <ul className="list-disc list-inside space-y-1 text-zinc-400">
          <li>Hard exclusion (oxidase / catalase / coagulase / hemolysis mismatch → 0%)</li>
          <li>Per-test log-likelihood จาก MCM % positivity</li>
          <li>Fallback: LIBRARY +/-/V → 90/50/10% ที่ weight 70%</li>
          <li>Prevalence priors: ++++ → 1.0, +++ → 0.40, ++ → 0.20, + → 0.10</li>
          <li>Softmax normalization → calibrated probabilities</li>
          <li>Coverage scaling: penalty หาก answers น้อยกว่า suite size</li>
        </ul>

        <h2 className="text-base font-semibold text-zinc-100 pt-2">🛠 Tech Stack</h2>
        <ul className="list-disc list-inside space-y-1 text-zinc-400">
          <li>Vite 6 + React 19 + TypeScript 5.7</li>
          <li>Tailwind CSS v3 + Liquid Glass design</li>
          <li>Zustand (state management)</li>
          <li>Vitest + jsdom (unit tests)</li>
          <li>Cloudflare Pages (deploy)</li>
        </ul>

        <p className="pt-2 text-xs text-zinc-500 border-t border-white/10">
          v4.0.0 · Open source · Educational project
        </p>
      </div>
    </div>
  )
}
