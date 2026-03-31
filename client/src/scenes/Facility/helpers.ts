import moment from "moment";
import { IFilterValues } from "../../services/types";

export const getLastUpdatedRanges = () => {
  const dateFormat = "MMM YYYY";
  const rangeDateFormat = "YYYY-MM";

  return [
    {
      id: 0,
      type: "lastUpdatedRange",
      label: `${moment()
        .subtract(4, "months")
        .format(dateFormat)} - ${moment().format(dateFormat)}`,
      values: [
        moment()
          .subtract(4, "months")
          .format(rangeDateFormat),
        moment()
          .add(1, "months")
          .format(rangeDateFormat)
      ],
      range: true
    },
    {
      id: 1,
      type: "lastUpdatedRange",
      label: `${moment()
        .subtract(8, "months")
        .format(dateFormat)} - ${moment()
        .subtract(5, "months")
        .format(dateFormat)}`,
      values: [
        moment()
          .subtract(8, "months")
          .format(rangeDateFormat),
        moment()
          .subtract(4, "months")
          .format(rangeDateFormat)
      ],
      range: true
    },
    {
      id: 2,
      type: "lastUpdatedRange",
      label: `${moment()
        .subtract(12, "months")
        .format(dateFormat)} - ${moment()
        .subtract(9, "months")
        .format(dateFormat)}`,
      values: [
        moment()
          .subtract(12, "months")
          .format(rangeDateFormat),
        moment()
          .subtract(8, "months")
          .format(rangeDateFormat)
      ],
      range: true
    },
    {
      id: 4,
      type: "lastUpdatedRange",
      label: `< ${moment()
        .subtract(13, "months")
        .format(dateFormat)}`,
      values: [
        moment("1970-01").format(rangeDateFormat),
        moment()
          .subtract(12, "months")
          .format(rangeDateFormat)
      ],
      range: true
    }
  ] as Array<IFilterValues>;
};

export const getAdvancedBasicFilter = (filterValues: Array<IFilterValues>) => {
  const districtsFilterOpt = filterValues
    .filter(filter => filter.type == "districts")
    .map(opt => {
      return { district_id: opt.id };
    });

  const facilityTypeFilterOpt = filterValues
    .filter(filter => filter.type == "facilityTypes")
    .map(opt => {
      return { facility_type_id: opt.id };
    });

  const regulatoryStatusFilterOpt = filterValues
    .filter(filter => filter.type == "regulatoryStatuses")
    .map(opt => {
      return { facility_regulatory_status_id: opt.id };
    });

  const operationalStatusFilterOpt = filterValues
    .filter(filter => filter.type == "operationalStatuses")
    .map(opt => {
      return { facility_operational_status_id: opt.id };
    });

  const ownerFilterOpt = filterValues
    .filter(filter => filter.type == "facilityOwners")
    .map(opt => {
      return { facility_owner_id: opt.id };
    });

  const rangeFilter = filterValues
    .filter(filter => filter.type == "lastUpdatedRange")
    .map(opt => {
      return opt.values
        ? {
            and: [
              { updated_at: { gte: new Date(opt?.values[0]) } },
              { updated_at: { lt: new Date(opt?.values[1]) } }
            ]
          }
        : [];
    });

  return {
    where: {
      and: [
        { or: districtsFilterOpt },
        { or: facilityTypeFilterOpt },
        { or: regulatoryStatusFilterOpt },
        { or: operationalStatusFilterOpt },
        { or: ownerFilterOpt },
        { or: rangeFilter }
      ]
    }
  };
};

export const getAdvancedResourcesFilter = (
  filterValues: Array<IFilterValues>
) => {
  let resFilterValues = filterValues.filter(
    filterValue => filterValue.type == "resources"
  );

  let filter =
    resFilterValues.length > 0
      ? resFilterValues.map(filterValue => {
          return filterValue.values
            ? {
                and: [
                  { resource_id: filterValue.id },
                  { quantity: { gte: filterValue.values[0] } },
                  { quantity: { lte: filterValue.values[1] } }
                ]
              }
            : [];
        })
      : [];

  return {
    where: {
      or: filter
    }
  };
};

export const getUtilitiesAdvancedFilter = (
  filterValues: Array<IFilterValues>
) => {
  let utilFilterValues = filterValues.filter(
    filterValue => filterValue.type == "utilities"
  );

  let filter =
    utilFilterValues.length > 0
      ? utilFilterValues.map(filterValue => {
          return {
            and: [{ utility_id: filterValue.id }]
          };
        })
      : [];

  return {
    where: {
      or: filter
    }
  };
};

export const getServicesAdvancedFilter = (
  filterValues: Array<IFilterValues>
) => {
  let serFilterValues = filterValues.filter(
    filterValue => filterValue.type == "services"
  );

  let filter =
    serFilterValues.length > 0
      ? serFilterValues.map(filterValue => {
          return {
            and: [{ service_id: filterValue.id }]
          };
        })
      : [];

  return {
    where: {
      or: filter
    }
  };
};
