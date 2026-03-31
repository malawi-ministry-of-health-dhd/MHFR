import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import KeyboardArrowDown from "@material-ui/icons/KeyboardArrowDown";
import { IFilterValues } from "../../services/types";
import { getLastUpdatedRanges } from "../../scenes/Facility/helpers";

function FacilityBasicFilterTab(props: Props) {
  const { dependancies, filterOptions } = props;

  const districts = useMemo<Array<IFilterValues>>(
    () =>
      (dependancies?.districts?.list || []).map((district: any) => ({
        type: "districts",
        id: district.id,
        label: district.district_name
      })),
    [dependancies]
  );

  const facilityTypes = useMemo<Array<IFilterValues>>(
    () =>
      (dependancies?.facilityTypes?.list || []).map((type: any) => ({
        type: "facilityTypes",
        id: type.id,
        label: type.facility_type
      })),
    [dependancies]
  );

  const regulatoryStatuses = useMemo<Array<IFilterValues>>(
    () =>
      (dependancies?.regulatoryStatuses?.list || []).map((status: any) => ({
        type: "regulatoryStatuses",
        id: status.id,
        label: status.facility_regulatory_status
      })),
    [dependancies]
  );

  const operationalStatuses = useMemo<Array<IFilterValues>>(
    () =>
      (dependancies?.operationalStatuses?.list || []).map((status: any) => ({
        type: "operationalStatuses",
        id: status.id,
        label: status.facility_operational_status
      })),
    [dependancies]
  );

  const facilityOwners = useMemo<Array<IFilterValues>>(
    () =>
      (dependancies?.owners?.list || []).map((owner: any) => ({
        type: "facilityOwners",
        id: owner.id,
        label: owner.facility_owner
      })),
    [dependancies]
  );

  const lastUpdatedRanges = useMemo(
    () => getLastUpdatedRanges() as Array<IFilterValues>,
    []
  );

  const [values, setValues] = useState<FilterState>(getFilterState(filterOptions));

  useEffect(() => {
    setValues(getFilterState(filterOptions));
  }, [filterOptions]);

  const replaceFilterGroup = async (
    type: string,
    nextFilters: Array<IFilterValues>
  ) => {
    await props.onAddFilter({ type, id: -1, label: "All" });

    for (const filter of nextFilters) {
      await props.onAddFilter(filter);
    }
  };

  const updateSelectValue = async (name: SelectStateKey, value: number) => {
    setValues(current => ({
      ...current,
      [name]: value
    }));

    const optionGroup = {
      districts,
      facilityTypes,
      regulatoryStatuses,
      facilityOwners,
      lastUpdatedRange: lastUpdatedRanges
    }[name];

    const selectedFilter = getSelectedFilter(optionGroup, value);
    await replaceFilterGroup(name, selectedFilter ? [selectedFilter] : []);
  };

  const toggleOperationalStatus = async (id: number) => {
    const nextOperationalStatuses = values.operationalStatuses.includes(id)
      ? values.operationalStatuses.filter(optionId => optionId !== id)
      : [...values.operationalStatuses, id];

    setValues(current => ({
      ...current,
      operationalStatuses: nextOperationalStatuses
    }));

    const selectedFilters = nextOperationalStatuses
      .map(optionId => getSelectedFilter(operationalStatuses, optionId))
      .filter(Boolean) as Array<IFilterValues>;

    await replaceFilterGroup("operationalStatuses", selectedFilters);
  };

  return (
    <Container>
      <Section>
        <SectionLabel>District</SectionLabel>
        <SelectWrap>
          <StyledSelect
            data-test="districts"
            value={values.districts}
            onChange={(event: any) =>
              updateSelectValue("districts", Number(event.target.value))
            }
          >
            <option value={-1}>All Districts</option>
            {districts.map(option => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </StyledSelect>
          <SelectIcon />
        </SelectWrap>
      </Section>

      <Section>
        <SectionLabel>Facility Type</SectionLabel>
        <ChipGroup data-test="facilityTypes">
          <FilterChip
            active={values.facilityTypes === -1}
            onClick={() => updateSelectValue("facilityTypes", -1)}
            type="button"
          >
            All
          </FilterChip>
          {facilityTypes.map(option => (
            <FilterChip
              active={values.facilityTypes === option.id}
              key={option.id}
              onClick={() => updateSelectValue("facilityTypes", option.id)}
              type="button"
            >
              {option.label}
            </FilterChip>
          ))}
        </ChipGroup>
      </Section>

      <Section>
        <SectionLabel>Operational Status</SectionLabel>
        <CheckboxGroup data-test="operationalStatuses">
          {operationalStatuses.map(option => (
            <CheckboxLabel key={option.id}>
              <CheckboxInput
                checked={values.operationalStatuses.includes(option.id)}
                onChange={() => toggleOperationalStatus(option.id)}
                type="checkbox"
              />
              <CheckboxText>{option.label}</CheckboxText>
            </CheckboxLabel>
          ))}
        </CheckboxGroup>
      </Section>

      <Section>
        <SectionLabel>Ownership</SectionLabel>
        <SelectWrap>
          <StyledSelect
            data-test="facilityOwners"
            value={values.facilityOwners}
            onChange={(event: any) =>
              updateSelectValue("facilityOwners", Number(event.target.value))
            }
          >
            <option value={-1}>All Ownership</option>
            {facilityOwners.map(option => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </StyledSelect>
          <SelectIcon />
        </SelectWrap>
      </Section>

      <Section>
        <SectionLabel>Regulatory Status</SectionLabel>
        <SelectWrap>
          <StyledSelect
            data-test="regulatoryStatuses"
            value={values.regulatoryStatuses}
            onChange={(event: any) =>
              updateSelectValue("regulatoryStatuses", Number(event.target.value))
            }
          >
            <option value={-1}>All Regulatory Statuses</option>
            {regulatoryStatuses.map(option => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </StyledSelect>
          <SelectIcon />
        </SelectWrap>
      </Section>

      <Section>
        <SectionLabel>Last Updated</SectionLabel>
        <SelectWrap>
          <StyledSelect
            data-test="lastUpdatedRange"
            value={values.lastUpdatedRange}
            onChange={(event: any) =>
              updateSelectValue("lastUpdatedRange", Number(event.target.value))
            }
          >
            <option value={-1}>Any Time</option>
            {lastUpdatedRanges.map(option => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </StyledSelect>
          <SelectIcon />
        </SelectWrap>
      </Section>

    </Container>
  );
}

export default FacilityBasicFilterTab;

type Props = {
  dependancies: any;
  filterOptions: Array<IFilterValues>;
  onAddFilter: any;
};

type FilterState = {
  districts: number;
  facilityTypes: number;
  regulatoryStatuses: number;
  operationalStatuses: Array<number>;
  facilityOwners: number;
  lastUpdatedRange: number;
};

type SelectStateKey =
  | "districts"
  | "facilityTypes"
  | "regulatoryStatuses"
  | "facilityOwners"
  | "lastUpdatedRange";

const getSingleFilterId = (
  filterOptions: Array<IFilterValues>,
  type: string
) => {
  const selectedFilter = filterOptions.find(option => option.type === type);
  return selectedFilter ? selectedFilter.id : -1;
};

const getFilterState = (filterOptions: Array<IFilterValues>): FilterState => ({
  districts: getSingleFilterId(filterOptions, "districts"),
  facilityTypes: getSingleFilterId(filterOptions, "facilityTypes"),
  regulatoryStatuses: getSingleFilterId(filterOptions, "regulatoryStatuses"),
  operationalStatuses: filterOptions
    .filter(option => option.type === "operationalStatuses")
    .map(option => option.id),
  facilityOwners: getSingleFilterId(filterOptions, "facilityOwners"),
  lastUpdatedRange: getSingleFilterId(filterOptions, "lastUpdatedRange")
});

const getSelectedFilter = (options: Array<IFilterValues>, id: number) =>
  options.find(option => option.id === id) || null;

const Container = styled.div`
  padding: 18px 18px 22px;
`;

const Section = styled.div`
  &:not(:first-child) {
    margin-top: 18px;
  }
`;

const SectionLabel = styled.div`
  margin-bottom: 10px;
  color: #7b879c;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  line-height: 1;
  text-transform: uppercase;
`;

const SelectWrap = styled.div`
  position: relative;
`;

const StyledSelect = styled.select`
  width: 100%;
  height: 46px;
  padding: 0 42px 0 14px;
  border: 1px solid #eef1f6;
  border-radius: 12px;
  background: #f7f8fb;
  color: #43526d;
  font-size: 14px;
  font-weight: 600;
  appearance: none;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease,
    background-color 0.2s ease;

  &:focus {
    border-color: #99b2dd;
    box-shadow: 0 0 0 3px rgba(9, 70, 168, 0.08);
    background: #ffffff;
  }
`;

const SelectIcon = styled(KeyboardArrowDown)`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #7b879c;
  pointer-events: none;
`;

const ChipGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FilterChip = styled.button<{ active: boolean }>`
  padding: 7px 12px;
  border: 1px solid ${props => (props.active ? "#0b5ed7" : "#e3e8f2")};
  border-radius: 999px;
  background: ${props => (props.active ? "#0f5cc0" : "#f4f6fa")};
  color: ${props => (props.active ? "#ffffff" : "#5e6c84")};
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease,
    background-color 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(3, 49, 120, 0.08);
  }
`;

const CheckboxGroup = styled.div`
  display: grid;
  gap: 10px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
`;

const CheckboxInput = styled.input`
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: #0f4fb3;
  cursor: pointer;
`;

const CheckboxText = styled.span`
  color: #24344d;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
`;
