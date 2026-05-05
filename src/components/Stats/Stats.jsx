import "./Stats.css";

function Stats() {
  const data = [
    { number: "1", label: "Years Experience" },
    { number: "5", label: "Projects" },
    { number: "9", label: "Skills" }
  ];

  return (
    <div className="stats">
      {data.map((item, i) => (
        <div key={i} className="stat-box">
          <h2>{item.number}</h2>
          <span>+</span>
          <p>{item.label}</p>
        </div>
      ))}
    </div>
  );
}

export default Stats;