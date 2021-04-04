const Stars = ({ max = 5, value = 0 }) => {
  const [state, setState] = React.useState({
    rating: value,
    currentlySelecting: true,
    selectionEnabled: true,
  });

  const { rating, currentlySelecting, selectionEnabled } = state;

  const mouseOverHandler = (e) =>
    selectionEnabled &&
    setState({
      ...state,
      currentlySelecting: true,
      rating: parseInt(e.target.dataset.starId) || rating,
    });

  return (
    <div>
      <div
        id={"stars"}
        onMouseLeave={() => {
          setState({ ...state, selectionEnabled: true });
        }}
        onClick={(e) =>
          setState({
            rating: parseInt(e.target?.dataset.starId) || rating,
            currentlySelecting: false,
            selectionEnabled: false,
          })
        }
        onMouseOver={mouseOverHandler}
      >
        {Array.from({ length: max }, (_, i) => (
          <i
            data-star-id={i + 1}
            key={i + 1}
            className={`fa-star ${rating >= i + 1 ? "fas" : "far"}`}
          />
        ))}
      </div>
      <p>
        You {currentlySelecting ? "are giving" : "have given"} {rating} stars!
      </p>
    </div>
  );
};

const KanbanListItem = ({
  listIndex,
  content,
  canMoveLeft = !!listIndex,
  canMoveRight,
  removeItem,
  index,
  moveItem,
}) => {
  return (
    <div className="item">
      <div
        className="move"
        onClick={canMoveLeft ? () => moveItem(index, listIndex - 1) : undefined}
      >
        {canMoveLeft ? "<" : ""}
      </div>
      <div className="item-text" onClick={() => removeItem(index)}>
        {content}
      </div>
      <div
        className="move"
        onClick={
          canMoveRight ? () => moveItem(index, listIndex + 1) : undefined
        }
      >
        {canMoveRight ? ">" : ""}
      </div>
    </div>
  );
};

const KanbanList = ({
  title,
  backgroundColor,
  items,
  listIndex,
  lastListIdx,
}) => {
  const [, dispatch] = useKanbanContext();

  const addItemHandler = (e) => {
    const item = e.target.parentNode.firstElementChild.value;
    if (!item) return;

    dispatch({
      type: ACTION.ADD,
      item,
      listIndex,
    });
    e.target.parentNode.firstElementChild.value = "";
  };
  const removeItem = (itemIndex) => {
    const removalConfirmed = confirm(`Remove ${items[itemIndex]} ?`);
    if (!removalConfirmed) return;
    dispatch({ type: ACTION.REMOVE, listIndex, itemIndex });
  };

  const moveItem = (itemIndex, to) =>
    dispatch({ type: ACTION.MOVE, from: listIndex, to, itemIndex });

  return (
    <section className="board-column">
      <header style={{ backgroundColor }}>
        <h5>{title}</h5>
      </header>
      <div className="items">
        {items.map((item, idx) => (
          <KanbanListItem
            key={idx}
            index={idx}
            listIndex={listIndex}
            content={item}
            canMoveLeft={!!listIndex}
            canMoveRight={listIndex !== lastListIdx}
            removeItem={removeItem}
            moveItem={moveItem}
          />
        ))}
      </div>
      <footer>
        <textarea rows="5"></textarea>
        <button type="button" onClick={addItemHandler}>
          Submit
        </button>
      </footer>
    </section>
  );
};

const KanbanBoard = () => {
  const [lists] = useKanbanContext();
  return (
    <div className="board">
      {lists.map((list, idx) => (
        <KanbanList
          listIndex={idx}
          key={idx}
          {...list}
          lastListIdx={lists.length - 1}
        />
      ))}
    </div>
  );
};

const initialLists = [
  {
    title: "To-Do",
    backgroundColor: "#35235d",
    items: [],
  },
  {
    title: "Doing",
    backgroundColor: "#cb2404",
    items: [],
  },
  {
    title: "Done",
    backgroundColor: "#4c49a2",
    items: [],
  },
  {
    title: "Approved",
    backgroundColor: "#a31a48",
    items: [],
  },
];

const KanbanContext = React.createContext();

const ACTION = {
  ADD: "ADD_ITEM",
  REMOVE: "REMOVE_ITEM",
  MOVE: "MOVE_ITEM",
};

const kanbanReducer = (state, action) => {
  switch (action.type) {
    case ACTION.ADD: {
      const { listIndex, item } = action;
      return state.map(({ items, ...rest }, idx) => ({
        ...rest,
        items: listIndex === idx ? [...items, item] : items,
      }));
    }
    case ACTION.REMOVE: {
      const { listIndex, itemIndex } = action;
      return state.map(({ items, ...rest }, idx) => ({
        ...rest,
        items:
          listIndex === idx
            ? items.filter((_, itemIdx) => itemIdx !== itemIndex)
            : items,
      }));
    }
    case ACTION.MOVE: {
      const { itemIndex, from, to } = action;
      const itemToMove = state[from].items[itemIndex];
      return state.map(({ items, ...rest }, idx) => {
        // Remove from origin list
        if (idx === from)
          items = items.filter((_, itemIdx) => itemIdx !== itemIndex);
        // Add to destination list
        if (idx === to) items = [...items, itemToMove];

        return { ...rest, items };
      });
    }
    default: {
      throw new Error(`${action.type} is not a valid action`);
    }
  }
};

const KanbanProvider = ({ children, initialLists }) => {
  const [lists, dispatch] = React.useReducer(
    kanbanReducer,
    initialLists,
    (initialLists) =>
      JSON.parse(localStorage.getItem("kanban_data")) || initialLists
  );

  React.useEffect(() => {
    localStorage.setItem("kanban_data", JSON.stringify(lists));
  }, [lists]);

  return (
    <KanbanContext.Provider value={[lists, dispatch]}>
      {children}
    </KanbanContext.Provider>
  );
};

const useKanbanContext = () => {
  const value = React.useContext(KanbanContext);

  if (!value)
    throw new Error(
      "KanbanContext can only be use by components inside KanbanProvider"
    );

  return value;
};

const App = () => {
  const [path] = React.useState(() => location.pathname.split("/").pop());
  switch (path) {
    case "stars":
      return <Stars />;
    case "kanban":
      return (
        <KanbanProvider initialLists={initialLists}>
          <KanbanBoard />
        </KanbanProvider>
      );
  }
};

ReactDOM.render(<App />, document.getElementById("root"));
