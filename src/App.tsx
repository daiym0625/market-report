import { useState, CSSProperties, ReactNode } from 'react';
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, LineChart as ReLineChart, Line, Legend,
  AreaChart, Area, PieChart as RePieChart, Pie, Cell,
} from 'recharts';

// ─── 主题色 ────────────────────────────────────────────────────
const TAB_COLORS: Record<number, string> = {
  0: '#3b82f6',
  1: '#16a34a',
  2: '#d97706',
  3: '#7c3aed',
  4: '#3b82f6',
};
const NAV_H = 49;
const STROKE = '#e5e7eb';
const CHART_COLORS = ['#3b82f6','#16a34a','#d97706','#ef4444','#7c3aed','#14b8a6','#f97316'];

// ─── 基础 UI 组件 ──────────────────────────────────────────────

function Stack({ gap = 16, style, children }: { gap?: number; style?: CSSProperties; children: ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>{children}</div>;
}
function Row({ gap = 8, align = 'center', justify, style, children }: {
  gap?: number; align?: string; justify?: string; style?: CSSProperties; children: ReactNode;
}) {
  return <div style={{ display: 'flex', flexDirection: 'row', gap, alignItems: align, justifyContent: justify, flexWrap: 'wrap', ...style }}>{children}</div>;
}
function Grid({ columns, gap = 16, children }: { columns: number | string; gap?: number; children: ReactNode }) {
  const cols = typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns;
  return <div style={{ display: 'grid', gridTemplateColumns: cols, gap }}>{children}</div>;
}
function H1({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, lineHeight: 1.3, ...style }}>{children}</h1>;
}
function H2({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0, lineHeight: 1.4, ...style }}>{children}</h2>;
}
function Stat({ value, label, tone }: { value: string; label: string; tone?: string }) {
  const color = tone === 'danger' ? '#ef4444' : tone === 'warning' ? '#d97706'
    : tone === 'success' ? '#16a34a' : tone === 'info' ? '#3b82f6' : '#111827';
  return (
    <div style={{ background: '#fff', border: `1px solid ${STROKE}`, borderRadius: 8, padding: '14px 16px' }}>
      <div style={{ fontSize: 18, fontWeight: 700, color, lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{label}</div>
    </div>
  );
}
function Text({ children, tone, size, weight, style }: {
  children: ReactNode; tone?: string; size?: 'small'; weight?: 'medium' | 'semibold'; style?: CSSProperties;
}) {
  const color = tone === 'secondary' ? '#6b7280' : 'inherit';
  const fw = weight === 'medium' ? 600 : weight === 'semibold' ? 700 : undefined;
  return <span style={{ fontSize: size === 'small' ? 12 : 14, color, lineHeight: 1.7, fontWeight: fw, ...style }}>{children}</span>;
}
function Pill({ children, tone }: { children: ReactNode; tone?: string }) {
  const bg = tone === 'info' ? '#eff6ff' : tone === 'success' ? '#f0fdf4' : tone === 'warning' ? '#fffbeb'
    : tone === 'danger' ? '#fef2f2' : tone === 'neutral' ? '#f3f4f6' : '#f3f4f6';
  const color = tone === 'info' ? '#3b82f6' : tone === 'success' ? '#16a34a' : tone === 'warning' ? '#d97706'
    : tone === 'danger' ? '#ef4444' : '#4b5563';
  return <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 99, fontSize: 12, fontWeight: 500, background: bg, color, whiteSpace: 'nowrap' }}>{children}</span>;
}
function Divider() {
  return <hr style={{ border: 'none', borderTop: `1px solid ${STROKE}`, margin: 0 }} />;
}
function Card({ children }: { children: ReactNode }) {
  return <div style={{ border: `1px solid ${STROKE}`, borderRadius: 8, overflow: 'hidden' }}>{children}</div>;
}
function CardHeader({ children, trailing }: { children: ReactNode; trailing?: ReactNode }) {
  return (
    <div style={{ padding: '10px 16px', background: '#f9fafb', borderBottom: `1px solid ${STROKE}`, fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <span>{children}</span>
      {trailing && <span style={{ flexShrink: 0 }}>{trailing}</span>}
    </div>
  );
}
function CardBody({ children }: { children: ReactNode }) {
  return <div style={{ padding: 16 }}>{children}</div>;
}
function TableBlock({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <div style={{ overflowX: 'auto', border: `1px solid ${STROKE}`, borderRadius: 6 }}>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>{headers.map((h, i) => <th key={i} style={{ padding: '8px 12px', textAlign: 'left', background: '#f9fafb', fontWeight: 600, fontSize: 12, borderBottom: `1px solid ${STROKE}`, whiteSpace: 'nowrap' }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 1 ? '#f9fafb' : '#fff' }}>
              {row.map((cell, ci) => <td key={ci} style={{ padding: '8px 12px', fontSize: 13, borderBottom: ri < rows.length - 1 ? `1px solid ${STROKE}` : 'none' }}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── 图表组件 ──────────────────────────────────────────────────

function SimpleBarChart({ categories, series, height = 200, horizontal = false, stacked = false }: {
  categories: string[]; series: { name: string; data: number[] }[];
  height?: number; horizontal?: boolean; stacked?: boolean;
}) {
  const data = categories.map((c, i) => ({ name: c, ...Object.fromEntries(series.map(s => [s.name, s.data[i]])) }));
  if (horizontal) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ReBarChart data={data} layout="vertical" margin={{ top: 4, right: 50, left: 10, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={200} />
          <Tooltip />
          {series.map((s, i) => <Bar key={s.name} dataKey={s.name} fill={CHART_COLORS[i]} radius={[0, 3, 3, 0]} stackId={stacked ? 'a' : undefined} />)}
        </ReBarChart>
      </ResponsiveContainer>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" interval={0} />
        <YAxis tick={{ fontSize: 11 }} /><Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s, i) => <Bar key={s.name} dataKey={s.name} fill={CHART_COLORS[i]} radius={[3, 3, 0, 0]} stackId={stacked ? 'a' : undefined} />)}
      </ReBarChart>
    </ResponsiveContainer>
  );
}

function SimpleLineChart({ categories, series, height = 220, fill = false }: {
  categories: string[]; series: { name: string; data: number[] }[]; height?: number; fill?: boolean;
}) {
  const data = categories.map((c, i) => ({ name: c, ...Object.fromEntries(series.map(s => [s.name, s.data[i]])) }));
  if (fill && series.length === 1) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.15} />
              <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
          <Area type="monotone" dataKey={series[0].name} stroke={CHART_COLORS[0]} fill="url(#ga)" strokeWidth={2} dot={{ r: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReLineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} />
        <Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s, i) => <Line key={s.name} type="monotone" dataKey={s.name} stroke={CHART_COLORS[i]} strokeWidth={2} dot={{ r: 3 }} />)}
      </ReLineChart>
    </ResponsiveContainer>
  );
}

function DonutChart({ data, size = 200 }: { data: { label: string; value: number }[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, index }: {
    cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; index: number;
  }) => {
    const R = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * R);
    const y = cy + r * Math.sin(-midAngle * R);
    const pct = ((data[index].value / total) * 100).toFixed(0);
    if (Number(pct) < 5) return null;
    return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11, fontWeight: 600 }}>{pct}%</text>;
  };
  return (
    <ResponsiveContainer width="100%" height={size}>
      <RePieChart>
        <Pie data={data.map(d => ({ name: d.label, value: d.value }))} dataKey="value" nameKey="name"
          cx="50%" cy="50%" innerRadius={size * 0.22} outerRadius={size * 0.38}
          paddingAngle={2} labelLine={false} label={renderLabel}>
          {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v: number) => [`${v}%`, '']} />
        <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
      </RePieChart>
    </ResponsiveContainer>
  );
}

// ─── 业务专用组件 ──────────────────────────────────────────────

function Src({ c }: { c: string }) {
  return <Text tone="secondary" size="small">数据来源：{c}</Text>;
}

function Badge({ label, bg }: { label: string; bg: string }) {
  return (
    <div style={{ background: bg, color: '#fff', borderRadius: 4, padding: '2px 9px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0, lineHeight: '18px' }}>
      {label}
    </div>
  );
}

type Pt = { tag: string; content: ReactNode };

const LIGHT_TINTS2: Record<string, string> = {
  '#16a34a': '#f0fdf4', '#d97706': '#fffbeb', '#7c3aed': '#f5f3ff', '#3b82f6': '#eff6ff',
};
const GRAY = '#6b7280';

function CBlock({ label, color, points, primary }: { label: string; color?: string; points: Pt[]; primary?: boolean }) {
  if (primary && color) {
    const solidBg = LIGHT_TINTS2[color] ?? '#f8f9ff';
    return (
      <div style={{ background: solidBg, border: `1px solid ${color}99`, borderLeft: `5px solid ${color}`, borderRadius: 6, padding: '14px 18px' }}>
        <Text weight="medium" size="small" style={{ color, display: 'block', marginBottom: 10 }}>{label}</Text>
        <Stack gap={8}>
          {points.map((p, i) => (
            <Row key={i} gap={10} align="start">
              <Badge label={p.tag} bg={color} />
              <div style={{ fontSize: 13, lineHeight: '1.5' }}>{p.content}</div>
            </Row>
          ))}
        </Stack>
      </div>
    );
  }
  return (
    <div style={{ background: '#F3F3F3', border: '1px solid #e0e0e0', borderLeft: `3px solid ${GRAY}`, borderRadius: 6, padding: '12px 16px' }}>
      <Text weight="medium" size="small" style={{ color: GRAY, display: 'block', marginBottom: 10 }}>{label}</Text>
      <Stack gap={8}>
        {points.map((p, i) => (
          <Row key={i} gap={10} align="start">
            <Badge label={p.tag} bg={GRAY} />
            <div style={{ fontSize: 13, lineHeight: '1.5' }}>{p.content}</div>
          </Row>
        ))}
      </Stack>
    </div>
  );
}

function DirBlock({ color, points }: { color: string; points: Pt[] }) {
  const LIGHT_TINTS: Record<string, string> = {
    '#16a34a': '#f0fdf4', '#d97706': '#fffbeb', '#7c3aed': '#f5f3ff', '#3b82f6': '#eff6ff',
  };
  const bg = LIGHT_TINTS[color] ?? '#f8f9ff';
  return (
    <div style={{ position: 'sticky', top: NAV_H, zIndex: 10, background: bg, border: `1px solid ${color}99`, borderLeft: `5px solid ${color}`, borderRadius: 6, padding: '14px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ background: color, borderRadius: 4, padding: '3px 12px', fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>产品切入方向</div>
        <span style={{ fontSize: 11, color, fontWeight: 600 }}>（滚动固定）</span>
      </div>
      <Stack gap={8}>
        {points.map((p, i) => (
          <Row key={i} gap={10} align="start">
            <Badge label={p.tag} bg={color} />
            <div style={{ fontSize: 13, lineHeight: '1.5' }}>{p.content}</div>
          </Row>
        ))}
      </Stack>
    </div>
  );
}

function Module({ num, title, pill, color, badgeColor, conclusion, children }: {
  num: string; title: string; pill?: ReactNode; color: string; badgeColor?: string; conclusion: ReactNode; children?: ReactNode;
}) {
  return (
    <Stack gap={12}>
      <Row gap={10} align="center">
        <div style={{ background: badgeColor ?? GRAY, color: '#fff', borderRadius: 5, padding: '3px 12px', fontSize: 13, fontWeight: 800, flexShrink: 0, letterSpacing: 1 }}>{num}</div>
        <H2>{title}</H2>
        {pill}
      </Row>
      {conclusion}
      {children && <div>{children}</div>}
    </Stack>
  );
}

function OppCard({ badge, color, title, subtitle, directions }: {
  badge: string; color: string; title: ReactNode; subtitle: string; directions: Pt[];
}) {
  return (
    <div style={{ position: 'relative', border: `1px solid ${STROKE}`, borderTop: `4px solid ${color}`, borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, background: color, color: '#fff', borderRadius: '0 0 0 8px', padding: '5px 14px', fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>{badge}</div>
      <div style={{ padding: '20px 20px 14px', borderBottom: `1px solid ${STROKE}` }}>
        <H2 style={{ paddingRight: 100 }}>{title}</H2>
        <Text size="small" tone="secondary" style={{ marginTop: 4, display: 'block' }}>{subtitle}</Text>
      </div>
      <div style={{ background: color + '14', padding: '14px 20px 18px' }}>
        <Text weight="medium" size="small" style={{ color, display: 'block', marginBottom: 10 }}>产品规划结论</Text>
        <Stack gap={9}>
          {directions.map((d, i) => (
            <Row key={i} gap={10} align="start">
              <Badge label={d.tag} bg={color} />
              <div style={{ fontSize: 13, lineHeight: '1.5' }}>{d.content}</div>
            </Row>
          ))}
        </Stack>
      </div>
    </div>
  );
}

// ─── 导航栏 ───────────────────────────────────────────────────

const TABS = [
  { id: 0, label: '规划概览' },
  { id: 1, label: '机会一：换机潮' },
  { id: 2, label: '机会二A：社媒数据恢复' },
  { id: 3, label: '机会二B：解锁→取证' },
  { id: 4, label: '产品路线图' },
];

function NavBar({ active, onChange }: { active: number; onChange: (id: number) => void }) {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 20, background: '#ececec', borderBottom: `1px solid #d4d4d4`, height: NAV_H }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '0 16px', overflowX: 'auto' }}>
        {TABS.map(tab => {
          const isActive = active === tab.id;
          const c = TAB_COLORS[tab.id];
          return (
            <button key={tab.id} onClick={() => onChange(tab.id)} style={{
              height: '100%', padding: '0 18px', border: 'none',
              borderBottom: isActive ? `3px solid ${c}` : '3px solid transparent',
              borderRadius: 0, background: 'transparent',
              color: isActive ? c : '#555555',
              fontWeight: isActive ? 700 : 500, fontSize: 13,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab 0：规划概览 ───────────────────────────────────────────

function TabOverview() {
  const C = TAB_COLORS[0];
  return (
    <Stack gap={28}>
      <Stack gap={6}>
        <Row gap={12}>
          <H1>Dr.Fone 产品规划市场洞察</H1>
          <Pill tone="info">2026 · 重新定位：社媒数据恢复 &amp; 手机修复</Pill>
        </Row>
        <Text tone="secondary">围绕两大战略机会进行产品规划，数据涵盖第三方市场报告、Semrush付费版关键词实测及Similarweb流量实测。</Text>
      </Stack>

      <Grid columns={2} gap={20}>
        <OppCard badge="最大利润机会" color={TAB_COLORS[0]}
          title="机会一：二手机换机潮驱动数据迁移与备份需求"
          subtitle="换机场景是用户付费意愿最强、决策最紧迫的产品触达时机"
          directions={[
            { tag: '方向①', content: <Text size="small">打造「<strong>换机数据迁移专区</strong>」作为产品首页默认推荐路径，以WhatsApp/LINE完整迁移为核心卖点</Text> },
            { tag: '方向②', content: <Text size="small"><strong>WhatsApp iOS↔Android一键迁移</strong>：iMazing完全不支持此场景，是Dr.Fone的独占差异化，直接切中40%失败率痛点</Text> },
            { tag: '方向③', content: <Text size="small">与二手机交易平台（Back Market、Cashify）合作分发，在换机完成后推送社媒迁移服务，精准触达高意图人群</Text> },
            { tag: 'SEO行动', content: <Text size="small">"recover deleted WhatsApp messages"（月搜2万、KD38%）是当前<strong>最优先SEO切入词</strong>，立即创建专属落地页</Text> },
          ]}
        />
        <OppCard badge="营收增长机会" color={TAB_COLORS[0]}
          title="机会二：社媒数据恢复与手机修复工具"
          subtitle="三大全市场空白功能，iMazing/AnyTrans/iMyFone均未覆盖，Dr.Fone可率先独占"
          directions={[
            { tag: '独家①', content: <><strong>WhatsApp选择性恢复</strong>：按联系人/日期精确恢复，官方和所有竞品均做不到，付费墙核心功能</> },
            { tag: '独家②', content: <><strong>Facebook Messenger恢复</strong>：iMazing/AnyTrans/iMyFone均不支持，全市场空白，率先建立品类认知</> },
            { tag: '独家③B端', content: <><strong>WhatsApp Business合规存档SaaS</strong>：GDPR刚需，2亿+企业用户，年费$299-999，所有竞品均未覆盖</> },
            { tag: '2027取证', content: <>「Dr.Fone Professional取证版」：复制iMazing Phone Evidence模式，扩展至<strong>Android+LINE双平台</strong>，$299+/次</> },
          ]}
        />
      </Grid>

      <Module num="01" title="Dr.Fone 流量基线" pill={<Pill>Similarweb · 2026年2-4月</Pill>} color={C}
        conclusion={<CBlock color={C} label="流量现状三大缺口" points={[
          { tag: '跳出率高', content: '跳出率64.35%偏高，自然搜索用户（占54%）落地后即离开，需为核心关键词创建专属落地页，首屏直接呈现解决方案' },
          { tag: '移动端主导', content: '移动端68.31%但软件下载在桌面，需优化「发送下载链接到电脑」的引导路径，降低跨端转化损耗' },
          { tag: 'AI流量萌芽', content: '生成式AI搜索流量已占0.6%，需提前布局ChatGPT/Perplexity等AI搜索引擎的内容结构优化' },
        ]} />}
      >
        <Stack gap={16}>
          <Grid columns={4} gap={14}>
            <Stat value="117.8万" label="月均访问量" />
            <Stat value="54.1%" label="自然搜索占比" tone="success" />
            <Stat value="64.35%" label="跳出率（偏高）" tone="danger" />
            <Stat value="68.31%" label="移动端占比" />
          </Grid>
          <Grid columns={2} gap={20}>
            <Stack gap={6}>
              <Text weight="medium" size="small">流量渠道分布</Text>
              <DonutChart data={[
                { label: '自然搜索 Organic', value: 54.1 },
                { label: '直接流量 Direct', value: 26.8 },
                { label: '付费搜索 Paid', value: 5.5 },
                { label: '社交付费 Social Paid', value: 3.7 },
                { label: '外链 Referral', value: 3.4 },
                { label: '社交自然 Social', value: 3.1 },
                { label: '联盟营销 Affiliate', value: 2.1 },
                { label: '其他', value: 1.3 },
              ]} size={200} />
              <Src c="Similarweb Pro · drfone.wondershare.com · 2026年2-4月均值" />
            </Stack>
            <Stack gap={6}>
              <Text weight="medium" size="small">品牌词搜索量地域对比（Semrush 2026年5月）</Text>
              <SimpleBarChart
                categories={['印度','美国','孟加拉','越南','埃及','德国']}
                series={[
                  { name: 'Dr.Fone（全球175K/月）', data: [40500,5400,18100,0,6600,0] },
                  { name: 'iMazing（全球97K/月）', data: [0,27100,0,8100,0,4400] },
                ]}
                stacked height={200}
              />
              <Src c="Semrush Guru · 2026年5月 · dash.3ue.co节点5" />
            </Stack>
          </Grid>
        </Stack>
      </Module>

      <Module num="02" title="竞品关键词与流量规模" pill={<Pill>Semrush 2026年5月实测</Pill>} color={C}
        conclusion={<CBlock color={C} label="关键战略缺口" points={[
          { tag: '内容差距', content: 'iMyFone拥有167.5K个有机关键词、月流量100.7K，WhatsApp相关词5,030个——是Dr.Fone社媒数据恢复赛道上内容最广的竞品' },
          { tag: '品牌差距', content: 'iMazing美国月搜27,100是Dr.Fone（5,400）的5倍，欧美高净值用户市场几乎被iMazing占据' },
          { tag: '行动方向', content: '产品重定位需同步加大英语内容产出（补充Dr.Fone缺失的关键词场景）和欧美渠道品牌投入' },
        ]} />}
      >
        <Grid columns={4} gap={14}>
          <Stat value="175K" label="Dr.Fone品牌词月搜索量" tone="success" />
          <Stat value="167.5K" label="iMyFone关键词总数（月流量100.7K）" tone="warning" />
          <Stat value="165K" label="iMobie关键词总数" />
          <Stat value="51.3K" label="iMazing关键词总数（月流量50.9K）" />
        </Grid>
      </Module>
    </Stack>
  );
}

// ─── Tab 1：换机潮 ────────────────────────────────────────────

function TabOpp1() {
  const C = TAB_COLORS[1];
  return (
    <Stack gap={32}>
      <Stack gap={4}>
        <Row gap={10}><H1>机会一：二手机换机潮驱动数据迁移需求</H1><Pill tone="success">最大利润机会</Pill></Row>
        <Text tone="secondary">全球二手机市场持续扩张，换机直接触发数据迁移需求，是用户付费意愿最强、决策最紧迫的场景。</Text>
      </Stack>

      <DirBlock color={C} points={[
        { tag: '方向①', content: <Text size="small">打造「换机数据迁移专区」作为产品首页默认推荐路径，以社媒数据（WhatsApp/LINE）完整迁移为核心卖点，直接切中官方工具40%失败率痛点</Text> },
        { tag: '方向②', content: <Text size="small">重点突破 <strong>WhatsApp iOS↔Android一键迁移</strong>，iMazing/AnyTrans/iMyFone均不能完整支持此场景，形成独占差异化</Text> },
        { tag: '方向③', content: <Text size="small">与二手机交易平台（Back Market、Cashify、Swappa）合作，在交易完成后推送「社媒数据迁移服务」，利用换机高意图时机提升转化</Text> },
        { tag: '内容机会', content: <Text size="small">SEO优先布局"recover deleted WhatsApp messages"（月搜2万、KD38%），针对Semrush识别出竞品占据但Dr.Fone缺失的换机类关键词补充专题内容页</Text> },
      ]} />

      <Module num="01" title="全球市场规模" pill={<Pill>2026年最新数据</Pill>} color={C}
        conclusion={<CBlock color={C} label="市场规模 → 产品战略支撑" points={[
          { tag: '体量验证', content: '2026年全球二手机市场$78.6B（YoY+10.4%），年出货量3.35亿台，数据迁移工具潜在需求约1亿次/年（按30%失败率计），市场天花板足够高' },
          { tag: '区域优先', content: '亚太$28.3B（CAGR 10.17%）是增速最快区域，印度CAGR 14.44%+WhatsApp 8.54亿用户高度叠加，是Dr.Fone换机迁移产品的首要目标市场' },
          { tag: '投放节奏', content: '市场资源优先级：印度（WhatsApp换机）→ 台湾/泰国（LINE换机）→ 东南亚（多平台），与用户规模和付费能力匹配' },
        ]} />}
      >
        <Stack gap={16}>
          <Grid columns={3} gap={14}>
            <Stat value="$78.6B" label="2026年全球市场（+10.4% YoY）" />
            <Stat value="$28.3B" label="2026年亚太市场（CAGR 10.17%）" tone="success" />
            <Stat value="~1亿次/年" label="数据迁移工具潜在需求" tone="warning" />
          </Grid>
          <Grid columns={2} gap={20}>
            <Stack gap={6}>
              <Text weight="medium" size="small">全球市场规模趋势（$B）</Text>
              <SimpleBarChart categories={['2024','2025','2026','2027','2028','2030','2033']} series={[{ name: '市场规模（$B）', data: [65.2,71.2,78.6,85.0,92.4,108.6,135.4] }]} height={200} />
              <Src c="Persistence Market Research《Refurbished & Used Mobile Phones 2033》CAGR 8.1%" />
            </Stack>
            <Stack gap={6}>
              <Text weight="medium" size="small">亚太市场规模趋势（$B）</Text>
              <SimpleLineChart categories={['2025','2026','2027','2028','2030','2034']} series={[{ name: '亚太规模（$B）', data: [24.2,28.3,31.2,34.3,41.6,58.0] }]} fill height={200} />
              <Src c="Deep Market Insights · Persistence MR · 亚太占全球约36%" />
            </Stack>
          </Grid>
          <Grid columns={3} gap={14}>
            <Stat value="$4.73B" label="中国（最大单一市场）" />
            <Stat value="$1.75B" label="印度（CAGR 14.44%，最快增速）" tone="success" />
            <Stat value="2.4年" label="全球平均换机周期" />
          </Grid>
        </Stack>
      </Module>

      <Module num="02" title="换机数据丢失痛点" color={C}
        conclusion={<CBlock color={C} label="痛点 → 功能设计锚点" points={[
          { tag: '认知缺口', content: '38%用户误以为「同步=备份」，换机后数据消失。产品首次启动内置「备份健康检测」，将教育用户转化为付费入口' },
          { tag: '误删场景', content: '34%数据丢失源于误操作，623万次/天的「后悔型删除」是WhatsApp选择性恢复功能最强的付费驱动场景' },
          { tag: '硬件故障', content: '30%数据丢失源于硬件故障，是手机解锁→数据救援完整链路的核心使用场景（机会二B的直接佐证）' },
        ]} />}
      >
        <Grid columns={2} gap={20}>
          <Stack gap={6}>
            <Text weight="medium" size="small">用户换机数据现状</Text>
            <SimpleBarChart categories={['换机遭遇迁移问题','曾丢失重要数据','误以为同步=备份','真正定期备份']} series={[{ name: '用户占比（%）', data: [30,40,38,33] }]} horizontal height={190} />
            <Src c="Reinforz.net 2025换机调研 · HandyRecovery Backup Survey 2025" />
          </Stack>
          <Stack gap={6}>
            <Text weight="medium" size="small">数据丢失根因分布</Text>
            <DonutChart data={[
              { label: '人为误操作（误删）', value: 34 },
              { label: '硬件故障', value: 30 },
              { label: '恶意软件/攻击', value: 22 },
              { label: '软件损坏', value: 11 },
              { label: '物理损坏/丢失', value: 6 },
            ]} size={200} />
            <Src c="HandyRecovery《The Data Loss Survey》2025 · 样本量10,000+" />
          </Stack>
        </Grid>
      </Module>

      <Module num="03" title="Semrush关键词实测：换机场景搜索需求" pill={<Pill>2026年5月实测</Pill>} color={C}
        conclusion={<CBlock color={C} label="关键词 → SEO与产品规划行动" points={[
          { tag: 'SEO最优先', content: '「recover deleted WhatsApp messages」：20K月搜、KD38%，印度占40%（8.1K），立即创建专属落地页，首屏呈现「无需备份即可恢复」' },
          { tag: '换机核心词', content: '「WhatsApp transfer to new phone」：8.1K月搜、KD45%，英国1.3K+印度880，是换机迁移专区首屏场景的SEO支撑' },
          { tag: '快速突破', content: '「WhatsApp backup recovery」：KD仅33%（最低竞争），适合冷启动快速获得首页排名，验证转化率后扩大投入' },
        ]} />}
      >
        <TableBlock headers={['关键词','全球月搜索量','KD难度','Top国家','产品规划机会']} rows={[
          ['recover deleted WhatsApp messages','20,000','38%（最优先）','印度8.1K · 巴基斯坦1.9K','产品内独立「WhatsApp误删恢复」功能模块'],
          ['WhatsApp transfer to new phone','8,100','45%','英国1.3K · 印度880','换机迁移专区首屏核心场景'],
          ['WhatsApp data recovery','5,940','58%（较高）','印度2.4K · 印尼1.0K','深化无备份恢复能力，覆盖更多机型'],
          ['LINE backup','970','—','印度260 · 日本140','LINE迁移专项，台湾/泰国本地化'],
          ['WhatsApp backup recovery','950','33%（最低竞争）','印度140 · 哥伦比亚90','新增「备份修复」功能，低竞争快速排名'],
        ]} />
        <Src c="Semrush Guru · dash.3ue.co节点5 · 2026年5月" />
      </Module>

      <Module num="04" title="竞品关键词差距分析" pill={<Pill>iMazing/iMyFone/iMobie实测</Pill>} color={C}
        conclusion={<CBlock color={C} label="Dr.Fone内容缺口与产品规划机会" points={[
          { tag: '换机最高优先', content: <Text size="small"><strong>「transfer whatsapp android to iphone」</strong>（万级月搜）：iMobie已排到#3-7位，Dr.Fone有技术优势可超越，直接支撑Android→iOS迁移P0功能</Text> },
          { tag: '内容快速切入', content: <Text size="small"><strong>「how to print a whatsapp message」</strong>（KD仅17，极低竞争）：iMazing #7，创建专题功能页可快速获排名，同时强化WhatsApp导出产品功能认知</Text> },
          { tag: 'LINE差异化', content: <Text size="small">iMyFone在LINE backup/restore已有5,030个词，Dr.Fone需以「<strong>富媒体完整性+B端官方账号存档</strong>」差异化，而非价格竞争（iMyFone全功能$19.95）</Text> },
          { tag: '渠道合作', content: <Text size="small">与<strong>二手机交易平台</strong>（Swappa/Back Market/Cashify）合作，换机完成后推送社媒迁移服务，转化率比通用广告高3-5倍</Text> },
        ]} />}
      >
        <Stack gap={16}>
          <Grid columns={3} gap={14}>
            <Stack gap={6}>
              <Text weight="medium" size="small">iMazing · WhatsApp相关853个词</Text>
              <TableBlock headers={['关键词','月搜','排名','KD']} rows={[
                ['export whatsapp chat','390','#6','39'],
                ['whatsapp backup software','110','#5','26'],
                ['migrate whatsapp to new iphone','90','#5','50'],
                ['how to print a whatsapp message','110','#7','17'],
                ['whatsapp backup iphone to iphone','140','#4','46'],
              ]} />
            </Stack>
            <Stack gap={6}>
              <Text weight="medium" size="small">iMyFone · WhatsApp相关5,030个词</Text>
              <TableBlock headers={['关键词','月搜','排名','KD']} rows={[
                ['whatsapp google voice number','1,000','#4-6','28'],
                ['transfer whatsapp android iphone','高','#3-7','35-45'],
                ['line backup restore','中','#3-8','25-35'],
                ['itransor for whatsapp','260','#1','16'],
                ['line data transfer','中','#5-10','—'],
              ]} />
            </Stack>
            <Stack gap={6}>
              <Text weight="medium" size="small">iMobie · WhatsApp相关2,222个词</Text>
              <TableBlock headers={['关键词','月搜','排名','KD']} rows={[
                ['transfer whatsapp android to iphone','高','#3-7','35-45'],
                ['save whatsapp video to pc','880','#6','22'],
                ['unlock iphone without passcode','高','#1-3','40-50'],
                ['transfer data to new iphone','高','#5-12','30-40'],
                ['move whatsapp to new phone','中','#6-15','35-45'],
              ]} />
            </Stack>
          </Grid>
          <Text weight="medium" size="small">Dr.Fone 产品内容缺口Top（竞品有排名、Dr.Fone缺失）</Text>
          <TableBlock headers={['关键词','月搜索量','竞品最强','KD','产品规划机会方向']} rows={[
            ['transfer whatsapp android to iphone','高（万级）','iMobie #3-7','35-45','Android→iOS WhatsApp完整迁移功能（iMazing完全不支持）'],
            ['whatsapp google voice number','1,000','iMyFone #4-6','28','WhatsApp账号管理扩展（新用户注册场景）'],
            ['export whatsapp chat','390','iMazing #6','39','WhatsApp对话导出功能（PDF/Excel/CSV）'],
            ['save whatsapp video to pc','880','iMobie #6','22','WhatsApp媒体文件PC端管理功能'],
            ['how to print a whatsapp message','110','iMazing #7','17','WhatsApp消息打印/存档（KD极低，快速切入）'],
            ['line backup restore','中等','iMyFone #3-8','25-35','LINE完整备份恢复，以完整性和B端差异化'],
            ['migrate whatsapp to new iphone','90','iMazing #5','50','iPhone→iPhone WhatsApp完整迁移'],
            ['unlock iphone without passcode','高','iMobie #1-3','40-50','iPhone解锁功能强化（与机会二B链路协同）'],
          ]} />
          <Src c="Semrush Guru · imazing.com(51.3K词) · imyfone.com(167.5K词) · imobie.com(165K词) · 2026年5月12日" />
        </Stack>
      </Module>
    </Stack>
  );
}

// ─── Tab 2：社媒数据恢复 ──────────────────────────────────────

function TabOpp2A() {
  const C = TAB_COLORS[2];
  return (
    <Stack gap={32}>
      <Stack gap={4}>
        <Row gap={10}><H1>机会二A：社媒数据备份与恢复</H1><Pill tone="warning">营收增长 · 蓝海差异化</Pill></Row>
        <Text tone="secondary">支持WhatsApp、Facebook Messenger和LINE的聊天数据备份和恢复。市场尚无单一工具完整覆盖三平台，Facebook Messenger恢复是所有竞品的完整空白区。</Text>
      </Stack>

      <DirBlock color={C} points={[
        { tag: '方向①', content: <Text size="small"><strong>WhatsApp「选择性恢复」</strong>作为付费墙核心功能，定价$29.99单次/$59.99年订阅，官方和所有竞品均做不到</Text> },
        { tag: '方向②', content: <Text size="small"><strong>LINE完整数据保险箱</strong>（富媒体/支付记录/跨平台迁移），台湾首发——iMyFone $19.95已切入，Dr.Fone以「完整性+B端存档」差异化</Text> },
        { tag: '方向③独占', content: <Text size="small"><strong>Facebook Messenger归档管理与设备损坏恢复</strong>——iMazing/AnyTrans/iMyFone均不支持，Dr.Fone独家全市场空白</Text> },
        { tag: '方向④B端', content: <Text size="small"><strong>WhatsApp Business合规对话存档SaaS</strong>（GDPR要求），面向印度/欧洲中小企业，年费$299-999，所有竞品均未覆盖</Text> },
      ]} />

      <Module num="01" title="竞品功能对比矩阵" color={C}
        conclusion={<CBlock color={C} label="三大差异化机会（结论前置）" points={[
          { tag: '独家①', content: 'WhatsApp选择性恢复：全市场空白，是Dr.Fone独占的核心技术壁垒——iMazing/AnyTrans/iMyFone均不支持' },
          { tag: '独家②', content: 'Facebook Messenger恢复：所有竞品均不支持，Dr.Fone可完整独占此功能品类，率先建立品类认知' },
          { tag: '独家③B端', content: 'WhatsApp Business合规存档：2亿+企业用户，GDPR合规刚需，竞品均未覆盖，年费$299-999高溢价蓝海' },
        ]} />}
      >
        <TableBlock headers={['功能','Dr.Fone','iMazing','AnyTrans（iMobie）','iMyFone','差异化机会']} rows={[
          ['WhatsApp备份（iOS）','支持','支持（PDF/Excel/CSV）','支持','支持（iMyTrans）','持平，加强选择性恢复'],
          ['WhatsApp备份（Android）','支持','完全不支持','有限','支持','iMazing盲区，Dr.Fone领先'],
          ['WhatsApp iOS↔Android迁移','支持（有失败）','完全不支持','iOS为主','支持','iMazing完全空白，优化后独占'],
          ['WhatsApp选择性恢复','有限','不支持','不支持','不支持','全市场空白，Dr.Fone独家'],
          ['LINE备份（iOS+Android）','部分','完全不支持','支持','完整（$19.95）','iMyFone低价切入，需完整性差异化'],
          ['Facebook Messenger恢复','部分','完全不支持','完全不支持','完全不支持','全市场空白，Dr.Fone独家'],
          ['B端WhatsApp合规存档','无','无','无','无','所有竞品空白，高溢价蓝海'],
        ]} />
      </Module>

      <Module num="02" title="WhatsApp · C端需求深度验证" pill={<Pill>2026年数据</Pill>} color={C}
        conclusion={<CBlock color={C} label="WhatsApp C端 → 功能设计三要点" points={[
          { tag: '选择性恢复P0', content: '官方工具不支持选择性恢复，33亿MAU全部受限。定价$29.99单次，以「官方永远做不到」作为付费说服核心' },
          { tag: '迁移攻关P0', content: 'iOS↔Android迁移失败率40%，42%恢复失败因账号不匹配——深度优化迁移成功率是2026年Q3的核心KPI' },
          { tag: '本地备份P1', content: 'WhatsApp云备份5个月自动删除+2024年2月6,500万次备份失败——本地离线备份解决用户「云端不可信」焦虑' },
        ]} />}
      >
        <Stack gap={16}>
          <Grid columns={4} gap={14}>
            <Stat value="33亿" label="WhatsApp月活用户（2026年1月）" />
            <Stat value="35亿" label="2026年底预计MAU（+6.45%）" tone="success" />
            <Stat value="8.54亿" label="印度用户数（全球最大市场）" />
            <Stat value="40%" label="iOS↔Android换机恢复失败率" tone="danger" />
          </Grid>
          <Grid columns={2} gap={20}>
            <Stack gap={6}>
              <Text weight="medium" size="small">官方备份系统性缺陷</Text>
              <TableBlock headers={['缺陷','具体表现','受影响规模']} rows={[
                ['不支持选择性恢复','只能整体恢复，无法精确恢复指定对话','33亿用户全部受限'],
                ['云备份5个月自动删除','不活跃账号备份被Google Drive清除','持续威胁'],
                ['iOS↔Android迁移失败率高','跨平台换机约40%失败','每年数亿次受影响'],
                ['账号不匹配恢复失败','42%恢复失败源于账号不一致','换机核心痛点'],
                ['每日8,900万条聊天被删','7%即刻后悔（≈623万次/天）','年化约22.7亿次'],
                ['2024年2月存储不足','6,500万次备份失败','单月规模巨大'],
              ]} />
              <Src c="WhatsApp用户行为分析 2025 · Medium · Google Drive论坛 2024" />
            </Stack>
            <Stack gap={6}>
              <Text weight="medium" size="small">用户备份行为现状</Text>
              <SimpleBarChart categories={['开启备份设置','每日真正执行','iOS↔Android迁移成功','知道选择性恢复']} series={[{ name: '用户比例（%）', data: [61,37,60,12] }]} horizontal height={220} />
              <Src c="HandyRecovery 2025 · WhatsApp用户行为分析" />
            </Stack>
          </Grid>
        </Stack>
      </Module>

      <Module num="03" title="WhatsApp · B端 Niche 市场" color={C}
        conclusion={<CBlock color={C} label="WhatsApp B端 → 合规存档高溢价切入" points={[
          { tag: '市场规模', content: '2亿+企业月活使用WhatsApp Business，印度73%企业用WhatsApp做客服——商业对话是有法律价值的数字资产' },
          { tag: '合规刚需', content: 'GDPR要求企业保留通讯记录3-7年，WhatsApp Business没有内置合规存档功能，是监管真空地带，年费$299-999定价合理' },
          { tag: '切入路径', content: '从「销售团队沟通记录备份」切入（需求明确、决策链短），再扩展至法律取证和合规存档（更高溢价）' },
        ]} />}
      >
        <Stack gap={14}>
          <Grid columns={4} gap={14}>
            <Stat value="2亿+" label="WhatsApp Business月活企业（2026）" tone="success" />
            <Stat value="73%" label="印度企业用WhatsApp做客服" tone="success" />
            <Stat value="2.84亿" label="2026年Business账号（YoY+42%）" />
            <Stat value="500万" label="使用API的企业数" />
          </Grid>
          <TableBlock headers={['B端场景','核心痛点','定价区间','目标市场','优先级']} rows={[
            ['WhatsApp Business历史对话存档','GDPR要求保留3-7年，官方无合规工具','$299-999/年','印度/欧洲中小企业','P0'],
            ['销售团队沟通记录备份','员工离职后客户沟通记录永久丢失','$199-599/年/席位','印度销售团队','P0'],
            ['WhatsApp消息法律取证','诉讼证据提取、HR调查','$299+/次','法务/合规部门','P1'],
            ['WhatsApp Business数据迁移','换设备时订单/客户数据丢失','$99-299/次','印度/东南亚商户','P1'],
          ]} />
          <Src c="TechRT · WizMessage《WhatsApp Business Statistics 2026》" />
        </Stack>
      </Module>

      <Module num="04" title="LINE · C端 + B端（亚太高渗透）" color={C}
        conclusion={<CBlock color={C} label="LINE市场 → 以完整性和B端超越iMyFone" points={[
          { tag: 'C端差异化', content: 'iMyFone $19.95已切入LINE市场，Dr.Fone不能打价格战。差异化在于「富媒体原文件完整备份+LINE Pay记录」——覆盖官方和iMyFone的全部盲区' },
          { tag: 'B端独占', content: '台湾商家俱乐部10万+成员是直接触达渠道，LINE官方账号数据归档（对话+媒体+支付记录）定价NT$2,999-9,999/年，竞品均未覆盖' },
          { tag: '首发市场', content: '台湾覆盖率94%+6.2万次/月亚太搜索量证明需求已存在，建议以台湾首发，配合繁体中文本地化快速建立口碑' },
        ]} />}
      >
        <Grid columns={2} gap={20}>
          <Stack gap={6}>
            <Text weight="medium" size="small">LINE各市场月活用户（2025 Q1）</Text>
            <SimpleBarChart categories={['日本（覆盖率79%）','台湾（覆盖率94%）','泰国（覆盖率81%）','印尼（4,000万用户）']} series={[{ name: '月活用户（百万）', data: [98,22,54,40] }]} horizontal height={180} />
            <Src c="LY Corporation IR Q1 2025 Earnings Presentation" />
          </Stack>
          <Stack gap={8}>
            <Grid columns={2} gap={12}>
              <Stat value="3.4亿" label="台湾LINE官方账号总数" tone="success" />
              <Stat value="85%" label="用户用官方账号购物/预约" />
              <Stat value="6.2万" label="亚太「LINE备份」月搜索量" />
              <Stat value="$19.95" label="iMyFone iTransor竞争定价" tone="warning" />
            </Grid>
            <TableBlock headers={['LINE官方局限','覆盖缺口','Dr.Fone机会']} rows={[
              ['不备份富媒体原文件','仅保留240px缩略图','完整富媒体备份+恢复（C端）'],
              ['LINE Pay收据排除','商业交易记录无法备份','支付记录归档（B端高溢价）'],
              ['无跨平台迁移','iOS↔Android全部受影响','一键跨平台迁移'],
              ['VOOM动态不备份','创作内容无法归档','内容创作者专项备份'],
            ]} />
          </Stack>
        </Grid>
      </Module>

      <Module num="05" title="Facebook Messenger · 全市场空白独占机会" color={C}
        conclusion={<CBlock color={C} label="Facebook Messenger → 先发独占策略" points={[
          { tag: '空白确认', content: 'iMazing、AnyTrans、iMyFone均不支持Messenger恢复，Dr.Fone是唯一有部分基础的工具，率先建立「Messenger数据恢复」品类认知' },
          { tag: '分层路径', content: '先上线「归档消息管理辅助」（成功率高，建立用户信任），再探索「设备损坏后本地消息提取」（与解锁→修复链路协同）' },
          { tag: 'B端机会', content: 'GDPR要求企业保留Messenger客服对话记录，欧洲/东南亚在Facebook经营的中小商户有存档刚需，定价$299-599/年' },
          { tag: '先发窗口', content: '当前竞品均未切入，率先建立品类认知可在此细分市场成为唯一选择，先发优势窗口有限' },
        ]} />}
      >
        <Grid columns={4} gap={14}>
          <Stat value="29亿" label="Facebook Messenger月活(2025)" />
          <Stat value="15%" label="用户曾丢失重要Messenger消息" tone="warning" />
          <Stat value="0个" label="支持Messenger恢复的竞品数量" tone="danger" />
          <Stat value="60%" label="受影响用户为18-34岁" />
        </Grid>
        <Src c="Socialeum《Master Facebook Message Recovery》2025 · Meta Ads Reach 2025" />
      </Module>
    </Stack>
  );
}

// ─── Tab 3：解锁→取证 ─────────────────────────────────────────

function TabOpp2B() {
  const C = TAB_COLORS[3];
  return (
    <Stack gap={32}>
      <Stack gap={4}>
        <Row gap={10}><H1>机会二B：手机解锁 → 数据恢复 → 社媒取证</H1><Pill>高壁垒 · 高溢价 · 完整链路</Pill></Row>
        <Text tone="secondary">打造从手机解锁到数据恢复的完整链路，并探索社媒信息取证。解锁是数据恢复的前置条件，打通完整链路是构建竞品无法复制的护城河的核心策略。</Text>
      </Stack>

      <DirBlock color={C} points={[
        { tag: '方向①链路', content: <Text size="small">「解锁→免费诊断数据状态→付费完整恢复」三步漏斗，解锁用户数据恢复转化率预计60%+。iMobie AnyUnlock是解锁领域最强竞品，但不做数据恢复——<strong>Dr.Fone是唯一打通完整链路的工具</strong></Text> },
        { tag: '方向②高溢价', content: <Text size="small">iCloud激活锁解锁服务面向7,200万台锁定二手iPhone，与二手机平台合作分发，定价$99-199/次。<strong>iMyFone LockWiper不支持激活锁</strong>，是Dr.Fone的明确竞争优势</Text> },
        { tag: '方向③套餐', content: <Text size="small">All-in-One年费套餐$149.99（解锁+社媒恢复+备份），比iMazing $59.99-69.99（iOS only）高$80但覆盖iOS+Android全场景</Text> },
        { tag: '方向④2027', content: <Text size="small">「Dr.Fone Professional取证版」——复制iMazing Phone Evidence模式但扩展至<strong>Android+LINE双平台</strong>，$299+/次，覆盖iMazing全部iOS限制盲区</Text> },
      ]} />

      <Module num="01" title="竞品功能对比：解锁 & 取证维度" color={C}
        conclusion={<CBlock color={C} label="三大差异化机会（结论前置）" points={[
          { tag: '独家①链路', content: '解锁→数据恢复完整链路：AnyUnlock/LockWiper只做解锁，iMazing只做管理，Dr.Fone是唯一能串联两个环节的工具' },
          { tag: '独家②激活锁', content: 'iCloud激活锁+数据恢复组合：iMyFone LockWiper不支持激活锁，7,200万台锁定iPhone解锁后必然需要数据处理，Dr.Fone可双收' },
          { tag: '独家③2027', content: 'Android社媒取证：iMazing仅iOS，其他竞品无取证功能。双平台版覆盖更大市场，2027年是抢先布局的窗口期' },
        ]} />}
      >
        <TableBlock headers={['功能','Dr.Fone','iMazing','AnyUnlock（iMobie）','LockWiper（iMyFone）','差异化机会']} rows={[
          ['屏幕密码解锁','支持','完全不支持','支持','支持','iMazing空白，Dr.Fone已有优势'],
          ['Apple ID解锁','支持','完全不支持','支持','支持','iMazing空白，持续领先'],
          ['iCloud激活锁解锁','支持','完全不支持','支持','不支持','iMyFone不支持，Dr.Fone差异化机会'],
          ['解锁→数据恢复完整链路','部分打通','不支持','不支持（仅解锁）','不支持（仅解锁）','全市场空白，Dr.Fone独家'],
          ['社媒取证（WhatsApp/SMS→PDF）','不支持','支持iOS · Phone Evidence','不支持','不支持','iMazing已验证，Dr.Fone可做Android+LINE版'],
          ['Android平台取证','不支持','完全不支持','不支持','不支持','全市场空白，2027年探索'],
        ]} />
      </Module>

      <Module num="02" title="手机解锁市场规模与需求验证" color={C}
        conclusion={<CBlock color={C} label="iCloud激活锁 → 与二手机平台联动分发" points={[
          { tag: '规模确认', content: '全球约3亿台流通二手iPhone，24%（约7,200万台）有激活锁，锁定设备仅售原价30%，用户有强烈动机为解锁支付溢价' },
          { tag: '分发策略', content: '与Back Market、Cashify、Swappa合作，在交易完成后推送激活锁解锁服务，精准触达最高需求场景，转化率远高于通用广告' },
          { tag: '定价依据', content: '基于设备折价损失定价：旗舰机（iPhone 14+）$149-199 / 中端机$79-99，用户ROI极高（解锁收益远大于服务费）' },
          { tag: '竞争优势', content: 'iMyFone LockWiper明确不支持iCloud激活锁，AnyUnlock支持但不做数据恢复，Dr.Fone是唯一全链路工具' },
        ]} />}
      >
        <Stack gap={16}>
          <Grid columns={4} gap={14}>
            <Stat value="$2.53B" label="2026年手机解锁服务市场" />
            <Stat value="76%" label="用户曾因忘记密码被锁机" tone="danger" />
            <Stat value="28%" label="二手机换手触发ID锁比例" tone="danger" />
            <Stat value="24%" label="二手iPhone存在激活锁（约7,200万台）" tone="danger" />
          </Grid>
          <Grid columns={2} gap={20}>
            <Stack gap={6}>
              <Text weight="medium" size="small">手机解锁服务市场规模（$B）</Text>
              <SimpleBarChart categories={['2024','2025','2026E','2027E','2028E','2030E','2035E']} series={[{ name: '市场规模（$B）', data: [2.26,2.35,2.53,2.73,2.93,3.39,5.00] }]} height={200} />
              <Src c="Dataintelo《Phone Unlocking Service Market 2025-2033》CAGR 7.3-7.8%" />
            </Stack>
            <Stack gap={8}>
              <Text weight="medium" size="small">iCloud激活锁二手iPhone规模</Text>
              <DonutChart data={[
                { label: '正常可用二手iPhone（76%）', value: 76 },
                { label: '存在iCloud激活锁（24%）', value: 24 },
              ]} size={180} />
              <Text size="small" tone="secondary">全球约3亿台流通二手iPhone，约7,200万台有激活锁，锁定设备仅售原价30%</Text>
              <Src c="iPhone Unlock Zone 2025 · Accio.com 2026 · eBay研究" />
            </Stack>
          </Grid>
        </Stack>
      </Module>

      <Module num="03" title="社媒信息取证：探索高溢价方向" pill={<Pill tone="warning">CAGR 15.6%</Pill>} color={C}
        conclusion={<CBlock color={C} label="社媒取证 → 复制iMazing Phone Evidence并超越" points={[
          { tag: '复制超越', content: 'iMazing Phone Evidence已验证律所客户模式，但仅iOS、不支持LINE/Android WhatsApp——Dr.Fone 2027年双平台版覆盖iMazing全部盲区，市场更大' },
          { tag: '切入时机', content: '移动取证CAGR 15.6%是相关市场增速最高赛道，当前市场空白窗口有限，2027年是抢先布局的关键节点' },
          { tag: '合规先行', content: '同步建立「取证合规声明」（Forensic Compliance Statement），明确工具用途限制，规避工具滥用法律风险' },
          { tag: '客户优先级', content: '律所（高客单价+标准化需求）→ 企业法务（年费订阅高LTV）→ 个人用户（辅助，量大但单价低）' },
        ]} />}
      >
        <Stack gap={16}>
          <Grid columns={4} gap={14}>
            <Stat value="$16B" label="2024年网络犯罪损失（同比+33%）" tone="danger" />
            <Stat value="CAGR 15.6%" label="移动取证增速（最高赛道）" tone="warning" />
            <Stat value="61%" label="企业2023年涉及至少一项监管程序" tone="warning" />
            <Stat value="$15.99B" label="eDiscovery市场(2025)" />
          </Grid>
          <Grid columns={2} gap={20}>
            <Stack gap={6}>
              <Text weight="medium" size="small">移动设备取证 &amp; eDiscovery市场规模（$B）</Text>
              <SimpleLineChart categories={['2025','2026E','2027E','2028E','2030E','2033E']} series={[
                { name: '移动设备取证（$B）', data: [1.92,2.22,2.56,2.96,3.95,5.54] },
                { name: 'eDiscovery（$B）', data: [15.99,17.60,19.38,21.34,25.88,31.41] },
              ]} height={220} />
              <Src c="Verified Market Reports CAGR 15.6% · 360iResearch eDiscovery CAGR 10.15%" />
            </Stack>
            <Stack gap={6}>
              <Text weight="medium" size="small">取证服务场景与定价</Text>
              <TableBlock headers={['取证场景','客户','定价','时机']} rows={[
                ['WhatsApp/LINE消息取证（PDF+哈希）','律所/合规','$299+/次','2027 Q3'],
                ['企业员工通讯审计（批量导出）','法务/HR','$999+/年','2027 Q4'],
                ['个人纠纷消息证据链','个人/律师代理','$99-199/次','2028'],
              ]} />
              <Src c="FBI IC3 2024年报 · 360iResearch eDiscovery" />
            </Stack>
          </Grid>
        </Stack>
      </Module>
    </Stack>
  );
}

// ─── Tab 4：产品路线图 ────────────────────────────────────────

function TabRoadmap() {
  const C = TAB_COLORS[4];
  return (
    <Stack gap={28}>
      <H1>产品规划路线图 &amp; 定价对标</H1>

      <Module num="01" title="定价策略：以平台宽度建立溢价" color={C} badgeColor={C}
        conclusion={<CBlock color={C} primary label="定价核心逻辑" points={[
          { tag: '价值锚点', content: 'iMazing $59.99-69.99/年（iOS only）已被市场验证可接受，Dr.Fone $79.99/年（iOS+Android）以全平台覆盖建立溢价，差价$10-20有清晰价值主张' },
          { tag: '套餐杠杆', content: 'All-in-One年费$149.99是所有竞品均没有的套餐，以「一个工具解决所有手机数据问题」作为核心价值主张，提升ARPU' },
          { tag: 'B端溢价', content: 'B端合规存档$299-999/年，所有竞品空白，iMazing已验证法律/企业方向，Dr.Fone以多平台覆盖直接超越' },
        ]} />}
      >
        <TableBlock headers={['层级','iMazing','AnyTrans（iMobie）','iMyFone','Dr.Fone建议定价','差异化依据']} rows={[
          ['C端单次恢复','N/A','N/A','$0（LINE免费）','$29.99/次','低门槛获客，引导年订阅'],
          ['C端年度订阅（多平台）','$59.99-69.99（iOS only）','$39.99/年','$19.95（LINE单项）','$79.99/年（iOS+Android）','全平台覆盖，$10-20溢价有清晰价值'],
          ['All-in-One（解锁+恢复+备份）','N/A','N/A','N/A','$149.99/年','所有竞品均无此套餐'],
          ['B端企业合规存档','$65-150/年（iOS）','N/A','N/A','$299-999/年（多平台）','GDPR合规刚需，竞品空白'],
          ['取证版（律所/企业）','$150+/年（含于B端）','N/A','N/A','$299/次或$999/年','双平台覆盖，比iMazing市场更大'],
        ]} />
      </Module>

      <Module num="02" title="六大产品差距机会" color={C} badgeColor={C}
        conclusion={<CBlock color={C} primary label="优先级排序与核心依据" points={[
          { tag: 'P0独家①', content: 'WhatsApp选择性恢复：全市场空白，所有竞品均不支持，是Dr.Fone独占的核心技术差异化' },
          { tag: 'P0独家②', content: 'Facebook Messenger恢复：所有竞品均不支持，Dr.Fone可完整独占此功能品类，先发优势窗口明确' },
          { tag: 'P0独家③', content: '解锁→数据恢复完整链路：AnyUnlock/LockWiper只做解锁，iMazing只做管理，Dr.Fone唯一打通，链路内转化率60%+' },
          { tag: 'P0 iMazing空白', content: 'iOS↔Android WhatsApp完整迁移：iMazing完全不支持，深度优化后独占最大换机场景' },
          { tag: 'P1所有竞品空白', content: 'B端WhatsApp合规存档SaaS：2亿+企业用户，GDPR刚需，年费$299-999，所有竞品均未覆盖' },
          { tag: 'P1 2027年', content: 'Android社媒取证（律所级）：iMazing仅iOS，其他竞品无取证功能，2027年双平台版覆盖更大市场' },
        ]} />}
      >
        <Grid columns={3} gap={14}>
          {[
            { title: 'WhatsApp选择性恢复', tag: 'P0 · 全市场独家', desc: '所有竞品均不支持，Dr.Fone独占的核心技术壁垒' },
            { title: 'Facebook Messenger恢复', tag: 'P0 · 全市场空白', desc: 'iMazing/AnyTrans/iMyFone均不支持，Dr.Fone可完整独占此功能品类' },
            { title: '解锁→数据恢复完整链路', tag: 'P0 · 链路独家', desc: 'AnyUnlock/LockWiper只做解锁，iMazing只做管理。Dr.Fone唯一打通，转化率60%+' },
            { title: 'iOS↔Android WhatsApp迁移', tag: 'P0 · iMazing空白', desc: 'iMazing完全不支持，AnyTrans/iMyFone部分支持。Dr.Fone深度优化后独占最大换机场景' },
            { title: 'B端WhatsApp合规存档SaaS', tag: 'P1 · 所有竞品空白', desc: '2亿+企业用户，GDPR合规刚需，年费$299-999，所有竞品均未覆盖' },
            { title: 'Android社媒取证（律所级）', tag: 'P1 · 2027年', desc: 'iMazing仅iOS，其他竞品无取证功能。双平台版覆盖更大市场，2027年上线' },
          ].map(item => (
            <Card key={item.title}>
              <CardHeader trailing={<Pill tone="success">{item.tag}</Pill>}>{item.title}</CardHeader>
              <CardBody><Text size="small">{item.desc}</Text></CardBody>
            </Card>
          ))}
        </Grid>
      </Module>

      <Module num="03" title="执行路线图" color={C} badgeColor={C}
        conclusion={<CBlock color={C} primary label="执行节奏与优先级" points={[
          { tag: '2026 Q3-Q4', content: 'WhatsApp选择性恢复+iOS↔Android迁移 · iCloud激活锁解锁完整覆盖 · Facebook Messenger归档管理MVP · 换机迁移专区首页上线' },
          { tag: '2027 Q1-Q2', content: 'LINE完整数据保险箱（台湾/泰国首发）· WhatsApp Business合规存档B端MVP · All-in-One年费套餐$149.99上线' },
          { tag: '2027 Q3-Q4', content: 'Dr.Fone Professional取证版（双平台，律所/合规）· 对标iMazing Phone Evidence并以平台宽度超越' },
          { tag: '2028+', content: 'AI驱动智能备份 · eDiscovery平台对接 · 多设备账户统一管理 · 进入移动取证工具全球Top 5' },
        ]} />}
      >
        <TableBlock headers={['阶段','时间','核心任务','关键市场佐证','成功指标']} rows={[
          ['奠基期','2026 Q3-Q4','WhatsApp选择性恢复+iOS↔Android迁移 · iCloud激活锁解锁 · Facebook Messenger归档MVP · 换机专区上线','33亿WhatsApp MAU · 40%迁移失败率 · 7,200万台激活锁 · Messenger全市场空白','社媒恢复付费转化>15% · 解锁月GMV>$100K'],
          ['增长期','2027 Q1-Q2','LINE完整数据保险箱（台湾/泰国首发）· WhatsApp Business合规存档B端MVP · All-in-One年费$149.99上线','台湾LINE覆盖94% · 2亿+WhatsApp Business企业 · iMyFone LINE $19.95倒逼差异化','台湾LINE MAU>5万 · ARR增长>40% · B端客户>200家'],
          ['突破期','2027 Q3-Q4','Dr.Fone Professional取证版（双平台）· 对标iMazing Phone Evidence并超越','移动取证CAGR 15.6% · iMazing仅iOS取证空白 · eDiscovery $17.6B(2026)','取证版月收入>$200K · 企业端GMV占比>20%'],
          ['扩张期','2028+','AI驱动智能备份 · eDiscovery平台对接 · 多设备账户统一管理','移动取证2033年达$5.54B · 企业合规持续深化','进入移动取证工具全球Top 5'],
        ]} />
      </Module>

      <Divider />
      <Card>
        <CardHeader>数据来源索引</CardHeader>
        <CardBody>
          <Stack gap={8}>
            <TableBlock headers={['来源','核心数据']} rows={[
              ['Persistence MR · Deep Market Insights · IMARC · IDC','2026年全球二手机$78.6B · 亚太$28.3B · 印度$1.75B(CAGR 14.44%)'],
              ['Resourcera · Backlinko · Chatarmin《WhatsApp Statistics 2026》','WhatsApp 33亿MAU（2026年1月）· 预计年底35亿 · 印度8.54亿用户'],
              ['TechRT · WizMessage《WhatsApp Business Statistics 2026》','2亿+月活WhatsApp Business企业 · 2026年2.84亿账号(YoY+42%)'],
              ['LY Corporation IR Q1 2025 · LINE Biz-Solutions SMB Day 2025','LINE全球1.94亿MAU · 台湾覆盖94% · 台湾3.4亿官方账号'],
              ['WhatsApp用户行为分析 · Medium 2025 · Google Drive论坛 2024','31%误删聊天 · 40%迁移失败 · 6,500万次备份失败（2024年2月）'],
              ['iMazing官网/Tracxn · iMobie官网 · iMyFone官网 2025-2026','iMazing iOS-only · AnyUnlock支持激活锁 · iMyFone iTransor $19.95全功能'],
              ['Dataintelo · eProvided · iPhone Unlock Zone · Accio.com','手机解锁市场$2.53B(2026) · 76%曾被锁机 · 24%二手iPhone有激活锁'],
              ['Verified Market Reports · 360iResearch · FBI IC3 2024','移动取证CAGR 15.6%，2033年$5.54B · eDiscovery $15.99B · 网络犯罪$16B'],
              ['Semrush Guru · dash.3ue.co节点5 · 2026年5月','Dr.Fone 175K月搜 · iMazing美国27.1K vs Dr.Fone 5.4K · recover deleted WhatsApp 20K(KD38%)'],
              ['Similarweb Pro · drfone.wondershare.com · 2026年2-4月','月均访问量117.8万 · 自然搜索54.1% · 跳出率64.35% · 移动端68.31%'],
            ]} />
            <Text tone="secondary" size="small">报告生成：2026年5月14日 · 市场数据以2026年最新报告为准</Text>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}

// ─── 主页面 ──────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif", fontSize: 14, color: '#111827' }}>
      <NavBar active={activeTab} onChange={setActiveTab} />
      <div style={{ padding: '28px 32px', maxWidth: 1140, margin: '0 auto', background: '#fff', minHeight: `calc(100vh - ${NAV_H}px)` }}>
        {activeTab === 0 && <TabOverview />}
        {activeTab === 1 && <TabOpp1 />}
        {activeTab === 2 && <TabOpp2A />}
        {activeTab === 3 && <TabOpp2B />}
        {activeTab === 4 && <TabRoadmap />}
      </div>
    </div>
  );
}
