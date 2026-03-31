import React, { useMemo, useState } from "react";
import {
  Checkbox,
  FormControl,
  InputBase,
  ListSubheader,
  ListItemText,
  MenuItem,
  Select
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import styled, { css } from "styled-components";
import Container from "../../components/atoms/Container";
//@ts-ignore
import Map from "../../components/organisms/MalawiMap";
import PieChartCompatibility from "../../components/molecules/PieChar";

const STATUS_COLORS: Record<string, string> = {
  Registered: "#003178",
  Pending: "#4355B9",
  "Not Registered": "#B8C7DA",
  Functional: "#003D38",
  "Closed (Temporary)": "#4355B9",
  Closed: "#BA1A1A"
};

const STATUS_BACKGROUNDS: Record<string, string> = {
  Registered: "rgba(0, 49, 120, 0.1)",
  Pending: "rgba(67, 85, 185, 0.12)",
  "Not Registered": "rgba(184, 199, 218, 0.22)",
  Functional: "rgba(0, 61, 56, 0.1)",
  "Closed (Temporary)": "rgba(67, 85, 185, 0.12)",
  Closed: "rgba(186, 26, 26, 0.1)"
};

const getStatusColor = (name: string) => STATUS_COLORS[name] || "#003178";
const getStatusBackground = (name: string) =>
  STATUS_BACKGROUNDS[name] || "rgba(0, 49, 120, 0.08)";

const getTotal = (data: Array<StatusDatum>) =>
  data.reduce((sum, item) => sum + Number(item.value || 0), 0);

const formatCount = (value: number) => `${value || 0}`;

const buildDonutSegments = (data: Array<StatusDatum>) => {
  const total = getTotal(data);
  let offset = 0;

  return data.map(item => {
    const value = Number(item.value || 0);
    const percent = total > 0 ? (value / total) * 100 : 0;
    const segment = {
      ...item,
      percent,
      offset
    };

    offset += percent;
    return segment;
  });
};

const getActiveOperationalStatus = (data: Array<StatusDatum>) =>
  data.find(item => item.name === "Functional") || data[0];

const Dashboard = (props: Props) => {
  const {
    cardsData,
    districts,
    licenseStatusGrapphData,
    operationalStatusGraphData,
    selectedDistricts,
    onRemoveDistrictFilter,
    onMapClick,
    onSummaryCardClick
  } = props;
  const [mobileDistrictSearch, setMobileDistrictSearch] = useState("");

  const primaryCard = cardsData[0];
  const secondaryCards = cardsData.slice(1);
  const operationalTotal = getTotal(operationalStatusGraphData);
  const licenseTotal = getTotal(licenseStatusGrapphData);
  const operationalFocus = getActiveOperationalStatus(
    operationalStatusGraphData
  );
  const operationalShare =
    operationalTotal > 0
      ? Math.round((Number(operationalFocus.value || 0) / operationalTotal) * 100)
      : 0;
  const donutSegments = buildDonutSegments(operationalStatusGraphData);
  const scopeLabel =
    selectedDistricts.length > 0
      ? `${selectedDistricts.length} district${
          selectedDistricts.length > 1 ? "s" : ""
        } selected`
      : "National registry view";
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  const districtNames = useMemo(
    () =>
      districts
        .filter(Boolean)
        .slice()
        .sort((left, right) => left.localeCompare(right)),
    [districts]
  );
  const filteredDistrictNames = useMemo(() => {
    const query = mobileDistrictSearch.trim().toLowerCase();

    if (!query) {
      return districtNames;
    }

    return districtNames.filter(district =>
      district.toLowerCase().includes(query)
    );
  }, [districtNames, mobileDistrictSearch]);

  const handleMobileSelectChange = (event: any) => {
    const rawValue = event.target.value;
    const nextSelectedDistricts =
      typeof rawValue === "string" ? rawValue.split(",") : rawValue;

    if (nextSelectedDistricts.length > selectedDistricts.length) {
      const addedDistrict = nextSelectedDistricts.find(
        (district: string) => !selectedDistricts.includes(district)
      );

      if (addedDistrict) {
        onMapClick(addedDistrict);
      }

      return;
    }

    const removedDistrict = selectedDistricts.find(
      district => !nextSelectedDistricts.includes(district)
    );

    if (removedDistrict) {
      onMapClick(removedDistrict);
    }
  };

  return (
    <PageShell>
      <Container>
        <PageLayout>
          <SidebarColumn>
            <ExplorerCard>
              <RegistryBadge>
                <div>
                  <RegistryEyebrow>Malawi Health Registry</RegistryEyebrow>
                  <RegistryTitle>District Explorer</RegistryTitle>
                </div>
              </RegistryBadge>
              <ExplorerLead>
                Click districts on the map to filter every metric on the
                dashboard.
              </ExplorerLead>

              <MobileDistrictFilterCard>
                <MobileFilterHeader>
                  <ScopeMeta>Mobile Filter</ScopeMeta>
                  <MobileFilterTitle>Select Districts</MobileFilterTitle>
                </MobileFilterHeader>
                {districtNames.length > 0 ? (
                  <MobileSelectField variant="outlined">
                    <Select
                      multiple
                      displayEmpty
                      value={selectedDistricts}
                      onChange={handleMobileSelectChange}
                      input={<MobileSelectInput />}
                      renderValue={(selected: any) => {
                        const values = selected as Array<string>;

                        return values.length > 0
                          ? `${values.length} district${
                              values.length > 1 ? "s" : ""
                            } selected`
                          : "Choose one or more districts";
                      }}
                      MenuProps={{
                        getContentAnchorEl: null,
                        anchorOrigin: {
                          vertical: "bottom",
                          horizontal: "left"
                        },
                        transformOrigin: {
                          vertical: "top",
                          horizontal: "left"
                        },
                        PaperProps: {
                          style: {
                            maxHeight: 280
                          }
                        },
                        MenuListProps: {
                          autoFocusItem: false
                        }
                      }}
                      onClose={() => setMobileDistrictSearch("")}
                      data-test="mobileDistrictDropdown"
                    >
                      <ListSubheader disableSticky>
                        <MobileSearchInput
                          autoFocus
                          value={mobileDistrictSearch}
                          placeholder="Search districts"
                          onChange={event =>
                            setMobileDistrictSearch(event.target.value)
                          }
                          onClick={event => event.stopPropagation()}
                          onKeyDown={event => event.stopPropagation()}
                        />
                      </ListSubheader>
                      {filteredDistrictNames.length > 0 ? (
                        filteredDistrictNames.map(district => (
                          <MenuItem key={district} value={district}>
                            <Checkbox
                              checked={selectedDistricts.includes(district)}
                              color="primary"
                            />
                            <ListItemText primary={district} />
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No districts match your search</MenuItem>
                      )}
                    </Select>
                  </MobileSelectField>
                ) : (
                  <MobileFilterEmpty>
                    District options are not available yet.
                  </MobileFilterEmpty>
                )}
              </MobileDistrictFilterCard>

              <MapCard>
                <MapHeader>
                  <MapTitle>Facility Distribution</MapTitle>
                  <MapHint>Interactive district filter</MapHint>
                </MapHeader>
                <MapContainer>
                  <Map
                    districtsSelected={selectedDistricts}
                    onClick={(district: any) => onMapClick(district)}
                    height={520}
                    selectedColor="#003178"
                    fill="#C8CFDA"
                  />
                </MapContainer>
              </MapCard>

              <ScopeCard>
                <ScopeMeta>Selected Districts</ScopeMeta>
                <ScopeValue>{scopeLabel}</ScopeValue>
                <SelectedDistricts>
                  {selectedDistricts.length > 0 ? (
                    selectedDistricts.map(district => (
                      <DistrictChip key={district}>
                        <span>{district}</span>
                        <DistrictChipButton
                          type="button"
                          aria-label={`Remove ${district}`}
                          onClick={() => onRemoveDistrictFilter(district)}
                        >
                          x
                        </DistrictChipButton>
                      </DistrictChip>
                    ))
                  ) : (
                    <EmptyStateMessage>
                      All districts are included. Select one or more map regions
                      to narrow the statistics.
                    </EmptyStateMessage>
                  )}
                </SelectedDistricts>
              </ScopeCard>

            </ExplorerCard>
          </SidebarColumn>

          <MainColumn>
            <HeroSection>
              <HeroHeader>
                <div>
                  <HeroEyebrow>National Dashboard</HeroEyebrow>
                  <HeroTitle>Health Registry Overview</HeroTitle>
                  <HeroDescription>
                    Review facility coverage, operating status, and licensing
                    posture from a single editorial workspace.
                  </HeroDescription>
                </div>
                <HeroMetaGroup>
                  <MetaPill>{scopeLabel}</MetaPill>
                  <MetaPill>Viewed {today}</MetaPill>
                </HeroMetaGroup>
              </HeroHeader>

              <SummaryGrid>
                {primaryCard && (
                  <PrimarySummaryCard
                    type="button"
                    data-test={primaryCard.title.replace(/ /g, "")}
                    onClick={() => onSummaryCardClick(primaryCard.type)}
                  >
                    <PrimaryCardTop>
                      <PrimarySummaryIcon
                        src={`/static/images/${primaryCard.icon}`}
                        alt={primaryCard.title}
                      />
                      <PrimarySummaryBadge>Registry Total</PrimarySummaryBadge>
                    </PrimaryCardTop>
                    <PrimarySummaryCount>{formatCount(primaryCard.count)}</PrimarySummaryCount>
                    <PrimarySummaryTitle>{primaryCard.title}</PrimarySummaryTitle>
                    <PrimarySummaryFoot>
                      <PrimarySummaryHint>
                        Open the facilities list with the current district
                        filters applied.
                      </PrimarySummaryHint>
                      <PrimarySummaryScope>
                        {selectedDistricts.length > 0
                          ? `${selectedDistricts.length} district filter${
                              selectedDistricts.length > 1 ? "s" : ""
                            } active`
                          : "National coverage active"}
                      </PrimarySummaryScope>
                    </PrimarySummaryFoot>
                  </PrimarySummaryCard>
                )}

                {secondaryCards.map(card => (
                  <SecondarySummaryCard
                    key={card.title}
                    type="button"
                    data-test={card.title.replace(/ /g, "")}
                    onClick={() => onSummaryCardClick(card.type)}
                  >
                    <SecondarySummaryHeader>
                      <SecondarySummaryIconWrap>
                        <SecondarySummaryIcon
                          src={`/static/images/${card.icon}`}
                          alt={card.title}
                        />
                      </SecondarySummaryIconWrap>
                      <SecondarySummaryType>Facility Type</SecondarySummaryType>
                    </SecondarySummaryHeader>
                    <SecondarySummaryCount>{formatCount(card.count)}</SecondarySummaryCount>
                    <SecondarySummaryTitle>{card.title}</SecondarySummaryTitle>
                    <SecondarySummaryHint>View matching facilities</SecondarySummaryHint>
                  </SecondarySummaryCard>
                ))}
              </SummaryGrid>
            </HeroSection>

            <InsightGrid>
              <StatusCard data-test="regulatoryStatus">
                <CompatibilityLayer aria-hidden="true">
                  <PieChartCompatibility
                    data={operationalStatusGraphData}
                    height={120}
                    width={120}
                    scheme={operationalStatusGraphData.map(item =>
                      getStatusColor(item.name)
                    )}
                  />
                </CompatibilityLayer>

                <CardHeader>
                  <div>
                    <SectionEyebrow>Operations</SectionEyebrow>
                    <SectionTitle>Facilities by Operational Status</SectionTitle>
                  </div>
                </CardHeader>

                <OperationalLayout>
                  <DonutWrap>
                    <DonutChart viewBox="0 0 42 42">
                      <circle
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="transparent"
                        stroke="#ECE6E4"
                        strokeWidth="3.2"
                      />
                      <g transform="rotate(-90 21 21)">
                        {donutSegments.map(segment => (
                          <circle
                            key={segment.name}
                            cx="21"
                            cy="21"
                            r="15.915"
                            fill="transparent"
                            stroke={getStatusColor(segment.name)}
                            strokeDasharray={`${segment.percent} ${
                              100 - segment.percent
                            }`}
                            strokeDashoffset={-segment.offset}
                            strokeLinecap="round"
                            strokeWidth="3.2"
                          />
                        ))}
                      </g>
                    </DonutChart>
                    <DonutCenter>
                      <DonutPercent>{operationalShare}%</DonutPercent>
                      <DonutLabel>{operationalFocus.name}</DonutLabel>
                    </DonutCenter>
                  </DonutWrap>

                  <StatusList>
                    {operationalStatusGraphData.map(item => {
                      const percent =
                        operationalTotal > 0
                          ? Math.round(
                              (Number(item.value || 0) / operationalTotal) * 100
                            )
                          : 0;

                      return (
                        <StatusRow key={item.name}>
                          <StatusMeta>
                            <StatusDot
                              style={{ background: getStatusColor(item.name) }}
                            />
                            <StatusName>{item.name}</StatusName>
                          </StatusMeta>
                          <StatusValues>
                            <StatusShare>
                              {percent}
                              %
                            </StatusShare>
                            <StatusCount>{formatCount(item.value)}</StatusCount>
                          </StatusValues>
                        </StatusRow>
                      );
                    })}
                  </StatusList>
                </OperationalLayout>
              </StatusCard>

              <StatusCard data-test="licenseStatus">
                <CompatibilityLayer aria-hidden="true">
                  <PieChartCompatibility
                    data={licenseStatusGrapphData}
                    height={120}
                    width={120}
                    scheme={licenseStatusGrapphData.map(item =>
                      getStatusColor(item.name)
                    )}
                  />
                </CompatibilityLayer>

                <CardHeader>
                  <div>
                    <SectionEyebrow>Licensing</SectionEyebrow>
                    <SectionTitle>Facilities by License Status</SectionTitle>
                  </div>
                  <StatusHighlight>Filtered against current scope</StatusHighlight>
                </CardHeader>

                <LicenseList>
                  {licenseStatusGrapphData.map(item => {
                    const percent =
                      licenseTotal > 0
                        ? Math.round(
                            (Number(item.value || 0) / licenseTotal) * 100
                          )
                        : 0;

                    return (
                      <LicenseRow key={item.name}>
                        <LicenseRowHeader>
                          <LicenseName>{item.name}</LicenseName>
                          <LicenseValue>{formatCount(item.value)}</LicenseValue>
                        </LicenseRowHeader>
                        <LicenseBarTrack>
                          <LicenseBarFill
                            style={{
                              background: getStatusColor(item.name),
                              width: `${percent}%`
                            }}
                          />
                        </LicenseBarTrack>
                        <LicenseMeta>
                          <LicensePercent
                            style={{
                              background: getStatusBackground(item.name),
                              color: getStatusColor(item.name)
                            }}
                          >
                            {percent}% of facilities
                          </LicensePercent>
                        </LicenseMeta>
                      </LicenseRow>
                    );
                  })}
                </LicenseList>

                <InsightNote>
                  The district map controls this panel too, so registration
                  counts stay aligned with the selected geography.
                </InsightNote>
              </StatusCard>
            </InsightGrid>
          </MainColumn>
        </PageLayout>
      </Container>
    </PageShell>
  );
};

export default Dashboard;

type StatusDatum = {
  name: string;
  value: number;
};

type SummaryDatum = {
  count: number;
  title: string;
  type: string;
  icon: string;
};

type Props = {
  cardsData: Array<SummaryDatum>;
  districts: Array<string>;
  licenseStatusGrapphData: Array<StatusDatum>;
  operationalStatusGraphData: Array<StatusDatum>;
  selectedDistricts: Array<any>;
  onRemoveDistrictFilter: Function;
  onMapClick: Function;
  onSummaryCardClick: Function;
};

const PageShell = styled.div`
  min-height: 100%;
  padding: 32px 0 48px;
  background:
    radial-gradient(circle at top right, rgba(67, 85, 185, 0.08), transparent 32%),
    radial-gradient(circle at bottom left, rgba(0, 61, 56, 0.08), transparent 26%),
    #fcf9f8;
`;

const PageLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(300px, 360px) minmax(0, 1fr);
  gap: 32px;
  align-items: start;

  @media (max-width: 1180px) {
    grid-template-columns: 1fr;
  }
`;

const SidebarColumn = styled.aside`
  position: sticky;
  top: 112px;

  @media (max-width: 1180px) {
    position: static;
  }
`;

const ExplorerCard = styled.div`
  display: grid;
  gap: 20px;
`;

const RegistryBadge = styled.div`
  display: flex;
  align-items: center;
`;

const RegistryEyebrow = styled.div`
  margin-bottom: 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #4355b9;
`;

const RegistryTitle = styled.h2`
  margin: 0;
  font-size: 28px;
  line-height: 1.1;
  color: #1b1c1c;
`;

const ExplorerLead = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.65;
  color: rgba(27, 28, 28, 0.72);
`;

const surfaceCardStyles = css`
  background: #ffffff;
  border-radius: 28px;
  padding: 24px;
  box-shadow: 0 24px 60px rgba(27, 28, 28, 0.06);
`;

const MobileDistrictFilterCard = styled.div`
  ${surfaceCardStyles}
  display: none;

  @media (max-width: 767px) {
    display: grid;
    gap: 14px;
  }
`;

const MobileFilterHeader = styled.div`
  display: grid;
  gap: 6px;
`;

const MobileFilterTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  color: #1b1c1c;
`;

const MobileSelectField = styled(FormControl)`
  width: 100%;
`;

const MobileSelectInput = withStyles({
  root: {
    width: "100%",
    minHeight: "48px",
    borderRadius: "16px",
    backgroundColor: "#f6f3f2",
    boxShadow: "inset 0 0 0 1px rgba(0, 49, 120, 0.08)",
    paddingLeft: "16px",
    paddingRight: "16px"
  },
  input: {
    padding: "14px 28px 14px 0",
    fontSize: "15px",
    fontWeight: 600,
    color: "rgba(27, 28, 28, 0.86)"
  }
})(InputBase);

const MobileSearchInput = styled.input`
  width: 100%;
  min-height: 40px;
  border: 0;
  border-radius: 12px;
  background: #ffffff;
  padding: 0 14px;
  font-size: 14px;
  color: #1b1c1c;
  box-shadow: inset 0 0 0 1px rgba(0, 49, 120, 0.08);
  outline: none;

  &::placeholder {
    color: rgba(27, 28, 28, 0.48);
  }
`;

const MobileFilterEmpty = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: rgba(27, 28, 28, 0.62);
`;

const ScopeCard = styled.div`
  ${surfaceCardStyles}
  display: grid;
  gap: 12px;
`;

const ScopeMeta = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #6e7480;
`;

const ScopeValue = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: #1b1c1c;
`;

const SelectedDistricts = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const DistrictChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  background: #f6f3f2;
  color: #1b1c1c;
  font-size: 13px;
  font-weight: 600;
`;

const DistrictChipButton = styled.button`
  border: 0;
  background: transparent;
  padding: 0;
  color: #4355b9;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
`;

const EmptyStateMessage = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(27, 28, 28, 0.72);
`;

const MapCard = styled.div`
  ${surfaceCardStyles}
  padding-bottom: 8px;

  @media (max-width: 767px) {
    display: none;
  }
`;

const MapHeader = styled.div`
  margin-bottom: 16px;
`;

const MapTitle = styled.h3`
  margin: 0 0 6px;
  font-size: 20px;
  color: #1b1c1c;
`;

const MapHint = styled.div`
  font-size: 13px;
  color: rgba(27, 28, 28, 0.65);
`;

const MapContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 420px;

  .map {
    max-width: 100%;
  }
`;

const MainColumn = styled.section`
  display: grid;
  gap: 28px;
`;

const HeroSection = styled.div`
  display: grid;
  gap: 24px;
`;

const HeroHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const HeroEyebrow = styled.div`
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #4355b9;
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(42px, 5vw, 64px);
  line-height: 0.95;
  letter-spacing: -0.04em;
  color: #1b1c1c;
`;

const HeroDescription = styled.p`
  max-width: 700px;
  margin: 18px 0 0;
  font-size: 16px;
  line-height: 1.7;
  color: rgba(27, 28, 28, 0.72);
`;

const HeroMetaGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const MetaPill = styled.div`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: #1b1c1c;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 20px 40px rgba(27, 28, 28, 0.05);
  backdrop-filter: blur(12px);
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 20px;

  @media (max-width: 1080px) {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const summaryButtonStyles = css`
  position: relative;
  border: 0;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease;

  &:hover {
    transform: translateY(-4px);
  }
`;

const PrimarySummaryCard = styled.button`
  ${summaryButtonStyles}
  grid-column: span 6;
  grid-row: span 2;
  overflow: hidden;
  border-radius: 32px;
  padding: 26px;
  color: #ffffff;
  background:
    linear-gradient(140deg, #003178, #4355b9 78%),
    #003178;
  box-shadow: 0 28px 70px rgba(0, 49, 120, 0.24);

  &::after {
    content: "";
    position: absolute;
    right: -60px;
    bottom: -40px;
    width: 220px;
    height: 220px;
    border-radius: 40px;
    background:
      linear-gradient(rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04)),
      url("/static/images/hospital.svg") center/110px no-repeat;
    transform: rotate(18deg);
    opacity: 0.9;
  }

  @media (max-width: 1080px) {
    grid-column: span 6;
    grid-row: span 1;
  }

  @media (max-width: 640px) {
    grid-column: span 1;
  }
`;

const PrimaryCardTop = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
`;

const PrimarySummaryIcon = styled.img`
  width: 62px;
  height: 62px;
  object-fit: contain;
`;

const PrimarySummaryBadge = styled.div`
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const PrimarySummaryCount = styled.p`
  position: relative;
  z-index: 1;
  margin: 26px 0 10px;
  font-size: clamp(64px, 7vw, 92px);
  line-height: 0.9;
  font-weight: 900;
  letter-spacing: -0.06em;
`;

const PrimarySummaryTitle = styled.h2`
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: 26px;
  line-height: 1.1;
`;

const PrimarySummaryFoot = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  gap: 16px;
  margin-top: 24px;
`;

const PrimarySummaryHint = styled.p`
  margin: 0;
  max-width: 420px;
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.84);
`;

const PrimarySummaryScope = styled.div`
  display: inline-flex;
  width: fit-content;
  min-height: 40px;
  align-items: center;
  padding: 0 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  font-size: 13px;
  font-weight: 700;
`;

const SecondarySummaryCard = styled.button`
  ${summaryButtonStyles}
  grid-column: span 3;
  display: grid;
  gap: 18px;
  padding: 22px;
  border-radius: 26px;
  background: #ffffff;
  box-shadow: 0 24px 60px rgba(27, 28, 28, 0.06);

  @media (max-width: 1080px) {
    grid-column: span 3;
  }

  @media (max-width: 640px) {
    grid-column: span 1;
  }
`;

const SecondarySummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const SecondarySummaryIconWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 18px;
  background: #f6f3f2;
`;

const SecondarySummaryIcon = styled.img`
  width: 30px;
  height: 30px;
  object-fit: contain;
`;

const SecondarySummaryType = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #6e7480;
`;

const SecondarySummaryCount = styled.p`
  margin: 0;
  font-size: 48px;
  line-height: 0.95;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: #1b1c1c;
`;

const SecondarySummaryTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  line-height: 1.2;
  color: #1b1c1c;
`;

const SecondarySummaryHint = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: rgba(27, 28, 28, 0.62);
`;

const InsightGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const StatusCard = styled.div`
  position: relative;
  overflow: hidden;
  display: grid;
  gap: 26px;
  min-height: 100%;
  padding: 28px;
  border-radius: 28px;
  background: #ffffff;
  box-shadow: 0 24px 60px rgba(27, 28, 28, 0.06);
`;

const CompatibilityLayer = styled.div`
  position: absolute;
  top: 18px;
  right: 18px;
  width: 18px;
  height: 18px;
  overflow: hidden;
  opacity: 0.04;
  pointer-events: none;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
`;

const SectionEyebrow = styled.div`
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #6e7480;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 26px;
  line-height: 1.15;
  color: #1b1c1c;
`;

const StatusHighlight = styled.div`
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  background: #f6f3f2;
  color: #003178;
  font-size: 12px;
  font-weight: 700;
`;

const OperationalLayout = styled.div`
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 28px;
  align-items: center;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const DonutWrap = styled.div`
  position: relative;
  width: 220px;
  height: 220px;
  margin: 0 auto;
`;

const DonutChart = styled.svg`
  width: 100%;
  height: 100%;
`;

const DonutCenter = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const DonutPercent = styled.div`
  font-size: 44px;
  font-weight: 900;
  line-height: 0.95;
  color: #003d38;
`;

const DonutLabel = styled.div`
  margin-top: 8px;
  max-width: 120px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6e7480;
`;

const StatusList = styled.div`
  display: grid;
  gap: 14px;
`;

const StatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 18px;
  background: #f6f3f2;
`;

const StatusMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 999px;
`;

const StatusName = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #1b1c1c;
`;

const StatusValues = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusShare = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #6e7480;
`;

const StatusCount = styled.div`
  min-width: 48px;
  font-size: 18px;
  font-weight: 900;
  text-align: right;
  color: #1b1c1c;
`;

const LicenseList = styled.div`
  display: grid;
  gap: 20px;
`;

const LicenseRow = styled.div`
  display: grid;
  gap: 10px;
`;

const LicenseRowHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
`;

const LicenseName = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #1b1c1c;
`;

const LicenseValue = styled.div`
  font-size: 22px;
  font-weight: 900;
  color: #1b1c1c;
`;

const LicenseBarTrack = styled.div`
  width: 100%;
  height: 12px;
  overflow: hidden;
  border-radius: 999px;
  background: #ece6e4;
`;

const LicenseBarFill = styled.div`
  height: 100%;
  border-radius: 999px;
  transition: width 240ms ease;
`;

const LicenseMeta = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const LicensePercent = styled.div`
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
`;

const InsightNote = styled.p`
  margin: 0;
  padding: 16px 18px;
  border-radius: 18px;
  background: #f6f3f2;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(27, 28, 28, 0.72);
`;
