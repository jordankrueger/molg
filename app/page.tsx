import type { CSSProperties } from 'react';
import predictionsData from '../data/predictions.json';
import { formatDate } from '../components/format';
import { readLatestCheck } from '../components/latest-check';

type Evidence = { title: string; url: string; date: string };
type Prediction = { title: string; description: string; progress: number; evidence: Evidence[] };
type Section = { title: string; description: string; predictions: Prediction[] };

const SHORT: Record<string, string> = {
  biology: 'Biology and health',
  neuroscience: 'Mind',
  economics: 'Economy',
  governance: 'Governance',
};

const sentenceCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
const average = (ps: Prediction[]) => ps.reduce((sum, p) => sum + p.progress, 0) / ps.length;

const ArrowUp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
);
const ArrowDown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
);
const ExternalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
);

export default function Home() {
  const { lastUpdated, ...rest } = predictionsData as unknown as { lastUpdated: string } & Record<string, Section>;
  const sections = Object.entries(rest);
  const all = sections.flatMap(([, s]) => s.predictions);
  const avg = average(all);
  const latest = readLatestCheck();

  return (
    <main>
      <div className="wrap hero">
        <div>
          <p className="figure" aria-label={`${Math.round(avg)} percent`}>{Math.round(avg)}<span className="unit">%</span></p>
          <h1>of the way to the future Machines of Loving Grace describes.</h1>
          <p className="lede">Dario Amodei&apos;s 2024 essay made {all.length} predictions about what powerful AI could do for health, the mind, poverty and democracy. This page scores each one against the news, every week.</p>
          <p className="meta">Average of all {all.length} scores. Updated {formatDate(lastUpdated)}.</p>
          <div className="actions">
            <a className="btn primary" href="#all">See all {all.length} predictions</a>
            <a className="btn ghost" href="https://www.reddit.com/r/MachinesofLovingGrace/" target="_blank" rel="noopener noreferrer">Discuss on Reddit</a>
          </div>
        </div>

        <figure className="skyline-card" aria-labelledby="skyTitle" style={{ margin: 0 }}>
          <figcaption className="skyline-head">
            <strong id="skyTitle">Each prediction, scored 0 to 100</strong>
            <span className="legend"><i aria-hidden="true"></i>Average {avg.toFixed(1)}</span>
          </figcaption>
          <div className="plot">
            <div className="yaxis" aria-hidden="true">
              {[100, 75, 50, 25, 0].map(v => <span key={v} style={{ bottom: `${v}%` }}>{v}</span>)}
            </div>
            <div className="skyline" role="list" style={{ gridTemplateColumns: `repeat(${all.length}, 1fr)` }}>
              <span className="avgline" style={{ bottom: `${avg}%` }}></span>
              {all.map((p, i) => (
                <div key={p.title} className="col" role="listitem" tabIndex={0} aria-label={`${p.title}: ${p.progress} of 100`} style={{ '--i': i } as CSSProperties}>
                  <span className="fill" style={{ height: `${p.progress}%` }}></span>
                  <span className="tip">{p.title}: {p.progress}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="groups" aria-hidden="true" style={{ gridTemplateColumns: sections.map(([, s]) => `${s.predictions.length}fr`).join(' ') }}>
            {sections.map(([key, s]) => <span key={key}>{SHORT[key] ?? sentenceCase(s.title)}</span>)}
          </div>
          <p className="hint">Hover or tab to a bar to see which prediction it is.</p>
        </figure>
      </div>

      <section className="wrap block" id="all" aria-labelledby="allTitle">
        <h2 id="allTitle">All {all.length} predictions</h2>
        <p className="intro">Grouped the way the essay groups them. A score is the tracker&apos;s judgment of how far the world has moved toward that prediction, not a measurement.</p>
        <div className="areas">
          {sections.map(([key, s]) => (
            <article key={key} className={`area${s.predictions.length > 4 ? ' wide' : ''}`} aria-labelledby={`h-${key}`}>
              <div className="area-head">
                <h3 id={`h-${key}`}>{sentenceCase(s.title)}</h3>
                <span className="avg">{Math.round(average(s.predictions))}%<small>average</small></span>
              </div>
              <p>{s.description}</p>
              <ul className="preds">
                {s.predictions.map(p => {
                  const newest = [...p.evidence].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
                  return (
                    <li key={p.title} className="pred">
                      <div className="pred-row"><b>{p.title}</b><span className="val">{p.progress}%</span></div>
                      <p>{p.description}</p>
                      <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={p.progress} aria-label={p.title}><i style={{ width: `${p.progress}%` }}></i></div>
                      {newest.map(e => (
                        <div key={e.url} className="source">
                          <ExternalIcon />
                          <span><a href={e.url} target="_blank" rel="noopener noreferrer">{e.title}</a>, {formatDate(e.date, true)}</span>
                        </div>
                      ))}
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="wrap block" id="how" aria-labelledby="howTitle">
        <h2 id="howTitle">How a score moves</h2>
        <p className="intro">Every Monday a script reads the week&apos;s science, health and policy news and asks an AI model to check it against strict rules. Code enforces the limits, and every change is logged with its source.</p>
        <div className="split">
          <div className="panel">
            <h3>Latest check</h3>
            {latest && (
              <>
                <p className="when">{formatDate(latest.date)}</p>
                {latest.text && <p>{latest.text}</p>}
                {latest.noChanges && <p>No score changed this week.</p>}
                {!latest.text && !latest.noChanges && latest.moves.length === 0 && <p>The next weekly check runs on Monday.</p>}
                {latest.moves.length > 0 && (
                  <ul className="moves">
                    {latest.moves.map(m => {
                      const down = m.to < m.from;
                      return (
                        <li key={m.prediction} className={`move${down ? '' : ' up'}`}>
                          {down ? <ArrowDown /> : <ArrowUp />}
                          <span><b>{m.prediction}</b><small>{m.note}</small></span>
                          <span className="delta">{down ? 'Down' : 'Up'} {Math.abs(m.to - m.from)} to {m.to}%</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}
            <p className="more"><a href="https://github.com/jordankrueger/molg/blob/main/AUDIT-LOG.md" target="_blank" rel="noopener noreferrer">Every past check, with sources</a></p>
          </div>
          <div className="panel">
            <h3>The rules</h3>
            <ul className="rules">
              <li><span className="ic" aria-hidden="true"><ArrowUp /></span><span><b>Up only with AI and proof</b>AI played a direct, named part, and the evidence is peer-reviewed, a regulator&apos;s decision, official data, or something already in use.</span></li>
              <li><span className="ic" aria-hidden="true"><ArrowDown /></span><span><b>Down on the same kind of proof</b>An official statistic worsening, a policy reversal, or a documented failure, whether or not AI was involved.</span></li>
              <li><span className="ic" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></svg></span><span><b>Never counted</b>Announcements, funding rounds, animal studies, opinion pieces and predictions.</span></li>
              <li><span className="ic" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16M4 6h16M4 18h10" /></svg></span><span><b>Small steps</b>At most 3 points per change, one change per prediction per week, and each article counts once.</span></li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
