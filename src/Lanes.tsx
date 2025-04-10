

const lanes = [-1.5, -0.5, 0.5, 1.5];

return (
{/* Linhas das lanes */}
{lanes.map((lane) => (
    <Line key={lane} x={lane} />
  ))}
)