import { webpack } from "replugged";
import { cl } from "..";
import Grid, { GridProps } from "./Grid";


const ScrollerClasses = await webpack.waitForModule<{ thin: string }>(webpack.filters.byProps("managedReactiveScroller"))

type Section<SectionT, ItemT> = SectionT & {
  items: Array<ItemT>;
};

interface SectionedGridListProps<ItemT, SectionT, SectionU = Section<SectionT, ItemT>> extends Omit<GridProps<ItemT>, "items"> {
  renderSectionHeader: (section: SectionU) => JSX.Element;
  getSectionKey: (section: SectionU) => string;
  sections: SectionU[];
}


export default function SectionedGridList<ItemT, SectionU,>(props: SectionedGridListProps<ItemT, SectionU>) {
  return <div className={[cl("sectioned-grid-list-container"), ScrollerClasses.thin]}>
    {props.sections.map(section => <div key={props.getSectionKey(section)} className={cl("sectioned-grid-list-section")}>
      {props.renderSectionHeader(section)}
      <Grid
        renderItem={props.renderItem}
        getItemKey={props.getItemKey}
        itemKeyPrefix={props.getSectionKey(section)}
        items={section.items}
      />
    </div>)}
  </div>;
}
