import { useEffect, useMemo, useState } from 'react'
import './App.css'

const WORD_BANK = {
  the: {
    embedding: [0.18, 0.12, 0.08],
    value: [0.82, 0.82, 0.82],
    role: 'служебное слово соединяет фразу',
  },
  a: {
    embedding: [0.22, 0.18, 0.14],
    value: [0.88, 0.82, 0.72],
    role: 'делает существительное конкретным',
  },
  curious: {
    embedding: [0.78, 0.42, 0.6],
    value: [0.96, 0.73, 0.92],
    role: 'описывает характер кота',
  },
  cat: {
    embedding: [0.9, 0.27, 0.58],
    value: [0.98, 0.67, 0.42],
    role: 'главный герой предложения',
  },
  quietly: {
    embedding: [0.64, 0.74, 0.32],
    value: [0.74, 0.86, 0.95],
    role: 'характеризует действие',
  },
  watched: {
    embedding: [0.71, 0.61, 0.25],
    value: [0.83, 0.7, 0.95],
    role: 'главный глагол',
  },
  fluttering: {
    embedding: [0.56, 0.84, 0.48],
    value: [0.7, 0.95, 0.82],
    role: 'передаёт движение',
  },
  butterfly: {
    embedding: [0.62, 0.38, 0.86],
    value: [0.92, 0.71, 0.98],
    role: 'на что направлено внимание',
  },
  small: {
    embedding: [0.48, 0.72, 0.28],
    value: [0.78, 0.9, 0.62],
    role: 'описывает робота',
  },
  robot: {
    embedding: [0.66, 0.54, 0.82],
    value: [0.71, 0.82, 0.98],
    role: 'исполнитель действия',
  },
  helps: {
    embedding: [0.59, 0.63, 0.33],
    value: [0.75, 0.84, 0.96],
    role: 'показывает действие помощи',
  },
  students: {
    embedding: [0.82, 0.46, 0.44],
    value: [0.98, 0.78, 0.67],
    role: 'кому помогают',
  },
  solve: {
    embedding: [0.58, 0.68, 0.41],
    value: [0.74, 0.86, 0.97],
    role: 'что делают учащиеся',
  },
  tricky: {
    embedding: [0.72, 0.4, 0.71],
    value: [0.92, 0.74, 0.91],
    role: 'характеризует задачи',
  },
  puzzles: {
    embedding: [0.63, 0.44, 0.83],
    value: [0.85, 0.74, 0.98],
    role: 'что решают',
  },
  math: {
    embedding: [0.81, 0.53, 0.39],
    value: [0.97, 0.79, 0.58],
    role: 'главная тема',
  },
  explains: {
    embedding: [0.74, 0.58, 0.36],
    value: [0.8, 0.82, 0.96],
    role: 'делает понятным',
  },
  how: {
    embedding: [0.42, 0.56, 0.31],
    value: [0.72, 0.86, 0.95],
    role: 'связывает части предложения',
  },
  planets: {
    embedding: [0.68, 0.52, 0.88],
    value: [0.77, 0.83, 0.98],
    role: 'о чём идёт речь',
  },
  dance: {
    embedding: [0.64, 0.59, 0.44],
    value: [0.82, 0.74, 0.96],
    role: 'метафора движения',
  },
  around: {
    embedding: [0.36, 0.64, 0.42],
    value: [0.68, 0.87, 0.92],
    role: 'указывает направление',
  },
  sun: {
    embedding: [0.77, 0.49, 0.78],
    value: [0.98, 0.74, 0.64],
    role: 'центр притяжения',
  },
}

const EXAMPLES = [
  {
    id: 'butterfly',
    title: 'Кот наблюдает за бабочкой',
    sentence: 'The curious cat quietly watched the fluttering butterfly',
    takeaway:
      'Попробуйте выбрать разные слова, чтобы увидеть, как внимание "переключается" между описанием героя и объектом наблюдения.',
  },
  {
    id: 'robot',
    title: 'Робот помогает ученикам',
    sentence: 'A small robot helps students solve tricky puzzles',
    takeaway:
      'Внимание робота сосредотачивается на том, кому он помогает и какие задачи решаются.',
  },
  {
    id: 'planets',
    title: 'Планеты танцуют вокруг солнца',
    sentence: 'Math explains how planets dance around the sun',
    takeaway:
      'Здесь видно, как внимание связывает научное объяснение и космическое действие.',
  },
]

const DIMENSION = 3
const FALLBACK_CACHE = new Map()

const clamp01 = (value) => Math.min(1, Math.max(0, value))

const tokenKey = (token) => token.toLowerCase().replace(/[^a-z]/g, '')

const getWordData = (token) => {
  const key = tokenKey(token)
  if (WORD_BANK[key]) {
    return WORD_BANK[key]
  }

  if (!FALLBACK_CACHE.has(key)) {
    const codes = key
      .split('')
      .map((char) => char.charCodeAt(0))
    const sums = [0, 0, 0]

    codes.forEach((code, index) => {
      sums[index % DIMENSION] += (code % 23) / 23
    })

    const total = sums.reduce((acc, value) => acc + value, 0) || 1
    const embedding = sums.map((value) => value / total)
    const valueVector = embedding.map((value) => 0.4 + value * 0.5)

    FALLBACK_CACHE.set(key, {
      embedding,
      value: valueVector,
      role: 'дополнительное слово контекста',
    })
  }

  return FALLBACK_CACHE.get(key)
}

const dot = (a, b) => a.reduce((acc, value, index) => acc + value * b[index], 0)

const toColor = (vector) => {
  const rgb = vector.map((value) => Math.round(clamp01(value) * 255))
  return `rgb(${rgb.join(',')})`
}

const computeAttention = (tokens, queryIndex, temperature) => {
  const info = tokens.map((token) => getWordData(token))
  const query = info[queryIndex]?.embedding ?? [1 / DIMENSION, 1 / DIMENSION, 1 / DIMENSION]

  const rawScores = info.map((word) => dot(query, word.embedding) / Math.sqrt(DIMENSION))
  const safeTemperature = Math.max(temperature, 0.05)
  const scaledScores = rawScores.map((score) => score / safeTemperature)
  const maxScore = Math.max(...scaledScores)
  const expScores = scaledScores.map((score) => Math.exp(score - maxScore))
  const sumExp = expScores.reduce((acc, value) => acc + value, 0) || 1
  const weights = expScores.map((value) => value / sumExp)

  const contextVector = info.reduce(
    (acc, word, index) => acc.map((value, i) => value + word.value[i] * weights[index]),
    [0, 0, 0],
  )

  return {
    weights,
    rawScores,
    contextColor: toColor(contextVector),
    info,
  }
}

const formatPercent = (value) => `${Math.round(value * 1000) / 10}%`

function App() {
  const [exampleId, setExampleId] = useState(EXAMPLES[0].id)
  const [queryIndex, setQueryIndex] = useState(0)
  const [temperature, setTemperature] = useState(1)

  const activeExample = useMemo(
    () => EXAMPLES.find((example) => example.id === exampleId) ?? EXAMPLES[0],
    [exampleId],
  )

  const tokens = useMemo(() => activeExample.sentence.split(' '), [activeExample.sentence])

  useEffect(() => {
    setQueryIndex(0)
  }, [activeExample])

  const { weights, rawScores, contextColor, info } = useMemo(
    () => computeAttention(tokens, queryIndex, temperature),
    [tokens, queryIndex, temperature],
  )

  const topInfluences = useMemo(() => {
    return tokens
      .map((token, index) => ({ token, index, weight: weights[index] }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
  }, [tokens, weights])

  return (
    <div className="app">
      <header className="hero">
        <p className="eyebrow">интерактивный эксперимент</p>
        <h1>Как работает внимание в нейросетях</h1>
        <p className="intro">
          Представьте, что у модели есть фонарик: выбираете слово &mdash; и фонарик освещает те части предложения, которые помогают
          понять его смысл. Управляйте вниманием и убедитесь, что каждое слово оставляет свой след в общей картине.
        </p>
      </header>

      <main className="content">
        <section className="panel">
          <h2>Шаг 1. Выберите историю</h2>
          <div className="example-grid">
            {EXAMPLES.map((example) => (
              <button
                key={example.id}
                type="button"
                className={`example-button ${example.id === activeExample.id ? 'active' : ''}`}
                onClick={() => setExampleId(example.id)}
              >
                <span className="example-title">{example.title}</span>
                <span className="example-sentence">{example.sentence}</span>
              </button>
            ))}
          </div>
          <p className="takeaway">{activeExample.takeaway}</p>
        </section>

        <section className="panel">
          <h2>Шаг 2. Наведите фонарик внимания</h2>
          <div className="tokens" role="list">
            {tokens.map((token, index) => {
              const isSelected = index === queryIndex
              const contribution = topInfluences.find((item) => item.index === index)

              return (
                <button
                  key={`${token}-${index}`}
                  type="button"
                  className={`token ${isSelected ? 'selected' : ''} ${contribution ? 'top' : ''}`}
                  onClick={() => setQueryIndex(index)}
                  aria-pressed={isSelected}
                >
                  <span className="token-word">{token}</span>
                  {contribution && (
                    <span className="token-weight">{formatPercent(weights[index])}</span>
                  )}
                  {isSelected && <span className="token-focus">фокус</span>}
                </button>
              )
            })}
          </div>
          <div className="slider-group">
            <label htmlFor="temperature">Температура внимания: {temperature.toFixed(1)}</label>
            <input
              id="temperature"
              type="range"
              min="0.3"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(event) => setTemperature(Number(event.target.value))}
            />
            <p className="slider-hint">
              Температура показывает, насколько "расфокусирован" фонарик. Низкие значения выделяют пару важных слов, высокие &mdash;
              распределяют внимание почти поровну.
            </p>
          </div>
        </section>

        <section className="panel">
          <h2>Шаг 3. Посмотрите, что заметила модель</h2>
          <div className="attention-cards">
            {tokens.map((token, index) => (
              <article key={`${token}-${index}-details`} className="attention-card">
                <header>
                  <span className="card-word">{token}</span>
                  <span className="card-role">{info[index]?.role}</span>
                </header>
                <div className="weight-bar">
                  <div className="weight-bar-fill" style={{ width: `${Math.round(weights[index] * 100)}%` }} />
                </div>
                <dl>
                  <div className="stat">
                    <dt>Вес внимания</dt>
                    <dd>{formatPercent(weights[index])}</dd>
                  </div>
                  <div className="stat">
                    <dt>Сырой скоринг</dt>
                    <dd>{rawScores[index].toFixed(2)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>

          <div className="context-section">
            <div className="context-color" style={{ background: contextColor }} aria-hidden />
            <div>
              <h3>Смешанный смысл</h3>
              <p>
                Модель собирает подсказки со всех слов и получает новый вектор смысла. Цветовое пятно показывает, как именно
                смешались значения. Самый большой вклад сейчас вносят:
              </p>
              <ol>
                {topInfluences.map((item) => (
                  <li key={`${item.token}-${item.index}`}>
                    <span className="highlight-word">{item.token}</span> — {formatPercent(item.weight)}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="panel tips">
          <h2>Как читать эту диаграмму</h2>
          <ul>
            <li>
              Внимание похоже на подсветку: чем ярче цвет полоски, тем больше слово помогает понять выделенный фрагмент.
            </li>
            <li>Температура регулирует ширину луча внимания: пробуйте крайние значения, чтобы увидеть разницу.</li>
            <li>В настоящих моделях таких лучей десятки, но принцип остаётся тем же — слова делятся смыслом друг с другом.</li>
          </ul>
        </section>
      </main>

      <footer className="footer">Создано специально для урока о внимании в нейросетях.</footer>
    </div>
  )
}

export default App
