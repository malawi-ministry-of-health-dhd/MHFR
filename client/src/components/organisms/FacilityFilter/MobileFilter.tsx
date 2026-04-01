import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import SearchTabs from "./SearchTabs";
import { connect } from "react-redux";
import styled from "styled-components";

import Card from "../../atoms/Card";

const drawerWidth = 320;

const FilterDrawer = (props: Props) => {
  const {
    open,
    dependancies,
    filterOptions,
    onAddFilter,
    onRemoveFilter
  } = props;
  return (
    <FilterContainer open={open}>
      <SearchTabs
        dependancies={dependancies}
        filterOptions={filterOptions ? filterOptions : []}
        onAddFilter={onAddFilter}
        onRemoveFilter={onRemoveFilter}
        mobile
      />
    </FilterContainer>
  );
};

type OwnProps = {
  open: boolean;
  onAddFilter: Function;
  onRemoveFilter: Function;
};

type Props = OwnProps & {
  classes?: any;
  dependancies?: any;
  filterOptions?: Array<any>;
};

const FilterContainer = styled<any>("div")`
  position: fixed;
  z-index: 1100;
  width: 100%;
  display: ${props => (props.open ? "block" : "none")};
  top: 120px;
`;

const mapStateToProps = (state: any) => ({
  dependancies: state.dependancies,
  filterOptions: state.facilities.advancedFilter.filterValues
});

const ConnectedMobileFilterDrawer = connect(
  mapStateToProps,
  null
)(FilterDrawer);

export default ConnectedMobileFilterDrawer as React.ComponentType<OwnProps>;
