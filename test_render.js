const d = {
  value: 3723,
  trend: [3551, 3593, 3634, 3622, 3638, 3708, 3723],
  labels: ['30 abr 2024', '1 may 2024', '2 may 2024', '3 may 2024', '4 may 2024', '5 may 2024', '6 may 2024']
};
const html = d.trend.map((v, i) => `<div>
    <div>${typeof v === 'number' && v > 100 ? Math.round(v).toLocaleString('es-CO') : v.toFixed(2)}</div>
    ${d.labels && d.labels[i] ? `<div style="font-size:.65rem;opacity:0.7;margin-top:2px">${d.labels[i]}</div>` : ''}
</div>`).join('');
console.log(html);
