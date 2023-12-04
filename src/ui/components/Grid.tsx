import { common } from "replugged";
import { cl } from "..";

const { React } = common;

export interface GridProps<ItemT> {
  renderItem: (item: ItemT) => JSX.Element;
  getItemKey: (item: ItemT) => string;
  itemKeyPrefix?: string;
  items: Array<ItemT>;
}

export default function Grid<ItemT,>({ renderItem, getItemKey, itemKeyPrefix: ikp, items }: GridProps<ItemT>) {
  return <div className={cl("sectioned-grid-list-grid")}>
    {items.map(item =>
      <React.Fragment
        key={`${ikp ? `${ikp}-` : ""}${getItemKey(item)}`}
      >
        {renderItem(item)}
      </React.Fragment>
    )}
  </div>;
}
