import React, { useMemo, useState } from "react";
import styled from "styled-components";
import SearchIcon from "@material-ui/icons/Search";
import Container from "../../../components/atoms/Container";
import FacilityList from "../../../components/organisms/FacilityList";
import FacilityToolBar from "../../../components/molecules/FacilityToolbar";
import FacilityDirectorySidebar from "../../../components/organisms/FacilityDirectorySidebar";
import FilterCards from "../../../components/molecules/FacilityFilterCards";
import MobileFilterDrawer from "../../../components/organisms/FacilityFilter/MobileFilter";
import MobileFilterButton from "../../../components/atoms/FacilityMobileFilterButton";
import MobilePageTitle from "../../../components/molecules/MobilePageTitle";
import Loader from "../../../components/atoms/Loader";
import { DesktopView, MobileView, MobileTitle } from "./Facility.styles";

const getSingleFilterOption = (filterOptions: Array<any>, type: string) =>
  filterOptions.find(option => option.type === type) || null;

const normalize = (value: any) => String(value || "").trim().toLowerCase();

const Facilities = (props: Props) => {
  const {
    onToggleDrawer,
    drawerOpen,
    facilities,
    onFacilityClicked,
    onRemoveFilter,
    onAddFilter,
    filterOptions,
    downloadList,
    isLoading,
    totalFacilitiesCount,
    dependancies
  } = props;

  const [searchValue, setSearchValue] = useState("");
  const selectedDistrict = useMemo(
    () => getSingleFilterOption(filterOptions, "districts"),
    [filterOptions]
  );
  const selectedRegulatoryStatus = useMemo(
    () => getSingleFilterOption(filterOptions, "regulatoryStatuses"),
    [filterOptions]
  );
  const selectedLastUpdatedRange = useMemo(
    () => getSingleFilterOption(filterOptions, "lastUpdatedRange"),
    [filterOptions]
  );

  const visibleFacilities = useMemo(() => {
    const searchQuery = normalize(searchValue);

    return facilities.filter((facility: any) => {
      const searchableText = normalize(
        [
          facility.code,
          facility.name,
          facility.common,
          facility.district,
          facility.ownership,
          facility.type,
          facility.status,
          facility.regulatoryStatus
        ].join(" ")
      );

      if (searchQuery && !searchableText.includes(searchQuery)) {
        return false;
      }

      return true;
    });
  }, [facilities, searchValue]);

  const hasAdvancedFilters = filterOptions.length > 0;

  const resultsSummary = (() => {
    if (normalize(searchValue)) {
      return `Showing ${visibleFacilities.length} results for "${searchValue.trim()}"`;
    }

    if (selectedDistrict?.label) {
      return `Showing ${visibleFacilities.length} results for "${selectedDistrict.label}"`;
    }

    if (selectedLastUpdatedRange?.label) {
      return `Showing ${visibleFacilities.length} facilities updated ${selectedLastUpdatedRange.label}`;
    }

    if (selectedRegulatoryStatus?.label) {
      return `Showing ${visibleFacilities.length} ${String(
        selectedRegulatoryStatus.label
      ).toLowerCase()} facilities`;
    }

    if (hasAdvancedFilters) {
      return `Showing ${visibleFacilities.length} filtered facilities`;
    }

    return `Showing ${visibleFacilities.length} verified facilities nationwide`;
  })();

  const visibleFacilityIds = useMemo(
    () => visibleFacilities.map((facility: any) => facility.id),
    [visibleFacilities]
  );

  return (
    <>
      <DesktopView>
        <RegistrySurface>
          <Container
            style={{
              minHeight: "100%",
              paddingTop: "32px",
              paddingBottom: "48px"
            }}
          >
            <DesktopShell>
              <SidebarColumn>
                <FacilityDirectorySidebar
                  dependancies={dependancies}
                  totalFacilitiesCount={totalFacilitiesCount}
                  filterOptions={filterOptions}
                  onAddFilter={onAddFilter}
                />
              </SidebarColumn>

              <MainColumn>
                <HeaderRow>
                  <HeaderCopy>
                    <RegistryTitle>National Facility Registry</RegistryTitle>
                    <RegistrySubtitle>{resultsSummary}</RegistrySubtitle>
                  </HeaderCopy>
                  <FacilityToolBar
                    downloadList={downloadList}
                    facilityIds={visibleFacilityIds}
                  />
                </HeaderRow>

                <DirectoryControls>
                  <DirectorySearchFieldWrap data-test="facilityDirectorySearch">
                    <DirectorySearchGlyph>
                      <SearchIcon fontSize="small" />
                    </DirectorySearchGlyph>
                    <DirectorySearchField
                      type="text"
                      value={searchValue}
                      placeholder="Search facility by name or code..."
                      onChange={event => setSearchValue(event.target.value)}
                    />
                  </DirectorySearchFieldWrap>
                </DirectoryControls>

                {filterOptions.length > 0 && (
                  <ActiveFiltersSurface>
                    <ActiveFiltersLabel>Active Filters</ActiveFiltersLabel>
                    <FilterCards
                      filterOptions={filterOptions}
                      onRemove={onRemoveFilter}
                    />
                  </ActiveFiltersSurface>
                )}

                {isLoading ? (
                  <LoaderShell>
                    <Loader style={{ height: "50vh" }} />
                  </LoaderShell>
                ) : (
                  <FacilityList onSelect={onFacilityClicked} data={visibleFacilities} />
                )}
              </MainColumn>
            </DesktopShell>
          </Container>
        </RegistrySurface>
      </DesktopView>

      <MobileView>
        <MobilePageTitle>
          <Container>
            <MobileTitle>
              {filterOptions.length > 0 ? "Filtered Facilities" : "Facilities"}
              <MobileFilterButton open={drawerOpen} onClick={onToggleDrawer} />
            </MobileTitle>
          </Container>
        </MobilePageTitle>
        <MobileFilterDrawer
          open={drawerOpen}
          onAddFilter={onAddFilter}
          onRemoveFilter={onRemoveFilter}
        />
        <Container
          style={{
            minHeight: "100%",
            paddingTop: "70px",
            paddingBottom: "32px",
            flexGrow: "1"
          }}
        >
          {isLoading ? (
            <Loader style={{ height: "50vh" }} />
          ) : (
            <FacilityList onSelect={onFacilityClicked} data={facilities} />
          )}
        </Container>
      </MobileView>
    </>
  );
};

type Props = {
  drawerOpen: boolean;
  onToggleDrawer: Function;
  facilities: Array<any>;
  onFacilityClicked: Function;
  onAddFilter: Function;
  onRemoveFilter: Function;
  filterOptions: Array<any>;
  downloadList: Function;
  isLoading: boolean;
  totalFacilitiesCount: number;
  dependancies: any;
};

export default Facilities;

const RegistrySurface = styled.div`
  background: linear-gradient(180deg, #fbfbfc 0%, #f7f8fb 100%);
`;

const DesktopShell = styled.div`
  display: grid;
  grid-template-columns: 286px minmax(0, 1fr);
  gap: 22px;
  align-items: start;
`;

const SidebarColumn = styled.div`
  min-width: 0;
`;

const MainColumn = styled.div`
  min-width: 0;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 16px;
`;

const HeaderCopy = styled.div`
  min-width: 0;
`;

const RegistryTitle = styled.h1`
  margin: 0 0 8px;
  color: #003178;
  font-family: "Public Sans", "Roboto", sans-serif;
  font-size: 34px;
  font-weight: 900;
  line-height: 1.02;
  letter-spacing: -0.04em;
`;

const RegistrySubtitle = styled.p`
  margin: 0;
  color: #606a79;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.45;
`;

const DirectoryControls = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const DirectorySearchFieldWrap = styled.div`
  display: flex;
  align-items: center;
  width: min(100%, 460px);
  min-height: 46px;
  padding: 0 14px;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 14px 28px rgba(0, 49, 120, 0.05);
`;

const DirectorySearchGlyph = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #7f8da0;
`;

const DirectorySearchField = styled.input`
  width: 100%;
  padding: 12px 0 12px 10px;
  border: 0;
  background: transparent;
  color: #1a2f4d;
  font-size: 14px;
  outline: none;

  &::placeholder {
    color: #9ba4b1;
  }
`;

const ActiveFiltersSurface = styled.div`
  margin-bottom: 20px;
  padding: 14px 16px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 12px 26px rgba(0, 49, 120, 0.04);
`;

const ActiveFiltersLabel = styled.div`
  margin-bottom: 10px;
  color: #708096;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  line-height: 1;
  text-transform: uppercase;
`;

const LoaderShell = styled.div`
  min-height: 360px;
  border-radius: 28px;
  background: #ffffff;
  box-shadow: 0 16px 34px rgba(0, 49, 120, 0.05);
`;
