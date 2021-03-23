const Star = ({ active, id }) => (
  <i data-star-id={id} className={`fa-star ${active ? "fas" : "far"}`} />
);

const Stars = ({ max = 5, value = 0 }) => {
  const [rating, setRating] = React.useState(value);
  const [selection, setSelection] = React.useState(0);
  const [canSelect, setCanSelect] = React.useState(true);

  const mouseOverHandler = (e) =>
    canSelect && setSelection(parseInt(e.target.dataset.starId) || selection);

  return (
    <div>
      <div
        id={"stars"}
        onMouseLeave={() => {
          setCanSelect(true);
        }}
        onClick={(e) => {
          setRating(parseInt(e.target?.dataset.starId) || rating);
          setSelection(0);
          setCanSelect(false);
        }}
        onMouseOver={mouseOverHandler}
      >
        {Array.from({ length: max }, (_, i) => (
          <Star
            id={i + 1}
            key={i + 1}
            active={selection ? selection >= i + 1 : rating >= i + 1}
          />
        ))}
      </div>
      <p>
        You{" "}
        {canSelect && selection
          ? `are giving ${selection}`
          : `have given ${rating}`}{" "}
        stars!
      </p>
    </div>
  );
};
ReactDOM.render(<Stars />, document.getElementById("root"));
