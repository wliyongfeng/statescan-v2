import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import BreadCrumb from "../components/breadCrumb";
import DetailTabs from "../components/detail/tabs";
import DetailLayout from "../components/layout/detailLayout";
import List from "../components/list";
import RuntimePalletsTable from "../components/runtime/tabTables/palletsTable";
import { Panel } from "../components/styled/panel";
import {
  clearRuntimeDetail,
  runtimeDetailSelector,
  runtimeFetchDetail,
} from "../store/reducers/runtimeSlice";
import {
  transformLookupTypesDict,
  transformTypedPallets,
} from "../utils/runtime";
import { bigNumberToLocaleString } from "../utils/viewFuncs";
import {
  clearHttpError,
  handleApiError,
} from "../utils/viewFuncs/errorHandles";
import { toRuntimeDetailItem } from "../utils/viewFuncs/toDetailItem";

export default function Runtime() {
  const { runtimeSlug } = useParams();
  const [version, startHeight] = runtimeSlug.split("-");

  const dispatch = useDispatch();
  const runtime = useSelector(runtimeDetailSelector);
  const dict = transformLookupTypesDict(runtime?.metadata?.lookup?.types);

  const listData = runtime ? toRuntimeDetailItem(runtime) : {};

  const typedPallets = transformTypedPallets(runtime?.metadata?.pallets, dict);

  useEffect(() => {
    if (version && startHeight) {
      clearHttpError(dispatch);
      dispatch(runtimeFetchDetail(version, startHeight)).catch((e) =>
        handleApiError(e, dispatch),
      );
    }

    return () => {
      dispatch(clearRuntimeDetail());
    };
  }, [version, dispatch, startHeight]);

  const breadCrumb = (
    <BreadCrumb
      data={[
        { name: "Runtimes", path: "/runtimes" },
        {
          name: version + "-" + bigNumberToLocaleString(startHeight),
        },
      ]}
    />
  );

  const tabs = [
    {
      name: "Pallets",
      count: runtime?.metadata?.pallets?.length,
      children: <RuntimePalletsTable pallets={typedPallets} />,
    },
  ];

  return (
    <DetailLayout breadCrumb={breadCrumb}>
      <Panel>
        <List data={listData} />
      </Panel>

      <DetailTabs tabs={tabs} />
    </DetailLayout>
  );
}
