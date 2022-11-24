import { useMutation, useQuery } from "@apollo/client";
import Spinner from "components/brickroom/Spinner";
import Layout from "components/layout/CreateAssetLayout";
import LoshPresentation from "components/LoshPresentation";
import dayjs from "dayjs";
import { useAuth } from "hooks/useAuth";
import devLog from "lib/devLog";
import {
  CREATE_INTENT,
  CREATE_LOCATION,
  CREATE_PROPOSAL,
  LINK_PROPOSAL_AND_INTENT,
  QUERY_RESOURCE,
  QUERY_UNIT_AND_CURRENCY,
  TRANSFER_ASSET,
} from "lib/QueryAndMutation";
import {
  CreateLocationMutation,
  EconomicResource,
  GetUnitAndCurrencyQuery,
  TransferAssetMutationVariables,
} from "lib/types";
import type { GetStaticPaths } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";
import { NextPageWithLayout } from "../../_app";
import useInBox from "../../../hooks/useInBox";
import { Controller, useForm } from "react-hook-form";
import SelectTags from "../../../components/SelectTags";
import { isRequired } from "../../../lib/isFieldRequired";
import SelectContributors, { ContributorOption } from "../../../components/SelectContributors";
import { Banner, Button, TextField } from "@bbtgnn/polaris-interfacer";
import SelectLocation from "../../../components/SelectLocation";
import { ChildrenProp as CP } from "../../../components/brickroom/types";
import { SelectOption } from "../../../components/brickroom/utils/BrSelectUtils";
import { LocationLookup } from "../../../lib/fetchLocation";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { errorFormatter } from "../../../lib/errorFormatter";

export namespace ClaimAssetNS {
  export interface Props extends CP {
    onSubmit: (data: FormValues) => void;
  }

  export interface FormValues {
    tags: Array<SelectOption<string>>;
    location: LocationLookup.Location | null;
    locationName: string;
    price: string;
    contributors: Array<ContributorOption>;
  }
}

const ClaimAsset: NextPageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [error, setError] = useState<string>("");

  const { sendMessage } = useInBox();
  const { t } = useTranslation("ResourceProps");
  const { loading, data } = useQuery<{ economicResource: EconomicResource }>(QUERY_RESOURCE, {
    variables: { id: id },
  });
  const e = data?.economicResource;

  const [createLocation, { data: spatialThing }] = useMutation(CREATE_LOCATION);
  const [transferAsset, { data: economicResource }] = useMutation(TRANSFER_ASSET);
  const [createProposal, { data: proposal }] = useMutation(CREATE_PROPOSAL);
  const [createIntent, { data: intent }] = useMutation(CREATE_INTENT);
  const [linkProposalAndIntent, { data: link }] = useMutation(LINK_PROPOSAL_AND_INTENT);
  const unitAndCurrency = useQuery<GetUnitAndCurrencyQuery>(QUERY_UNIT_AND_CURRENCY).data?.instanceVariables;

  type SpatialThingRes = CreateLocationMutation["createSpatialThing"]["spatialThing"];

  async function handleCreateLocation(formData: ClaimAssetNS.FormValues): Promise<SpatialThingRes | undefined> {
    try {
      const { data } = await createLocation({
        variables: {
          name: formData.locationName,
          addr: formData.location?.address.label!,
          lat: formData.location?.position.lat!,
          lng: formData.location?.position.lng!,
        },
      });
      const st = data?.createSpatialThing.spatialThing;
      devLog("success: location created", st);
      return st;
    } catch (e) {
      devLog("error: location not created", e);
      throw e;
    }
  }

  async function handleClaim(formData: ClaimAssetNS.FormValues) {
    try {
      const location = await handleCreateLocation(formData);
      // devLog is in handleCreateLocation
      const tags = formData.tags.map(t => encodeURI(t.value));
      devLog("info: tags prepared", tags);
      const contributors = formData.contributors.map(c => c.value);
      devLog("info: contributors prepared", contributors);
      const metadata = JSON.stringify({ ...e!.metadata, repositoryOrId: e!.metadata.repo, contributors: contributors });
      devLog("info: metadata prepared", metadata);

      const variables: TransferAssetMutationVariables = {
        resource: e!.id,
        agent: user!.ulid,
        name: e!.name,
        note: e!.note || "",
        metadata: metadata,
        location: location?.id!,
        oneUnit: e!.onhandQuantity.hasUnit!.id,
        creationTime: dayjs().toISOString(),
        tags: tags,
      };
      devLog("info: asset variables created", variables);

      //transfer asset
      const { data: transferAssetData, errors } = await transferAsset({ variables });
      if (errors) throw new Error("AssetNotTransfered");

      const economicEvent = transferAssetData?.createEconomicEvent.economicEvent!;
      const asset = economicEvent?.toResourceInventoriedAs!;
      devLog("success: asset transfered");
      devLog("info: economicEvent", economicEvent);
      devLog("info: asset", asset);

      // Create proposal & intent
      const { data: createProposalData } = await createProposal();
      devLog("info: created proposal", createProposalData?.createProposal.proposal);

      const { data: createIntentData } = await createIntent({
        variables: {
          agent: user?.ulid!,
          resource: asset.id!,
          oneUnit: unitAndCurrency?.units.unitOne.id!,
          howMuch: 1,
          currency: unitAndCurrency?.specs.specCurrency.id!,
        },
      });
      devLog("info: created intent", createIntentData);

      // Linking the two of them
      const { data: linkData } = await linkProposalAndIntent({
        variables: {
          proposal: createProposalData?.createProposal.proposal.id!,
          item: createIntentData?.item.intent.id!,
          payment: createIntentData?.payment.intent.id!,
        },
      });
      devLog("info: created link", linkData);

      // TODO: Send message
      // ...

      // Redirecting user
      await router.replace(`/asset/${createProposalData?.createProposal.proposal.id}`);
    } catch (e) {
      devLog(e);
      let err = errorFormatter(e);
      setError(err);
    }
  }

  const defaultValues: ClaimAssetNS.FormValues = {
    tags: [],
    location: null,
    locationName: "",
    price: "1",
    contributors: [], // Array<{id:string, name:string}>
  };

  const schema = yup
    .object({
      tags: yup.array(yup.object()),
      location: yup.object().required(),
      locationName: yup.string().required(),
      price: yup.string().required(),
      contributors: yup.array(
        yup.object({
          id: yup.string(),
          name: yup.string(),
        })
      ),
    })
    .required();

  const form = useForm<ClaimAssetNS.FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { formState, handleSubmit, register, control, setValue, watch } = form;
  const { isValid, errors, isSubmitting } = formState;

  return (
    <div className="pb-6">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-12 pt-14">
        <div className="md:col-start-2 md:col-end-7">
          <h2>{t("claim your ownership over this asset")}</h2>
        </div>
      </div>
      {loading && <Spinner />}
      {!loading && e && (
        <>
          <LoshPresentation economicResource={data?.economicResource} />
        </>
      )}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-12 pt-14">
        <div className="md:col-start-2 md:col-end-7">
          <form onSubmit={handleSubmit(handleClaim)} className="w-full pt-12 space-y-12">
            <Controller
              control={control}
              name="tags"
              render={({ field: { onChange, onBlur, name, ref } }) => (
                <SelectTags
                  name={name}
                  id={name}
                  ref={ref}
                  onBlur={onBlur}
                  onChange={onChange}
                  label={`${t("Tags")}:`}
                  isMulti
                  placeholder={t("Open-source, 3D Printing, Medical use")}
                  helpText={t("Select a tag from the list, or type to create a new one")}
                  error={errors.tags?.message}
                  creatable={true}
                  requiredIndicator={isRequired(schema, name)}
                />
              )}
            />

            <Controller
              control={control}
              name="contributors"
              render={({ field: { onChange, onBlur, name, ref } }) => (
                <SelectContributors
                  name={name}
                  ref={ref}
                  id={name}
                  onBlur={onBlur}
                  onChange={onChange}
                  label={`${t("Contributors")}:`}
                  isMulti
                  placeholder={t("Type to search for a user")}
                  error={errors.contributors?.message}
                  removeCurrentUser
                  creatable={false}
                  requiredIndicator={isRequired(schema, name)}
                />
              )}
            />

            <div className="space-y-4">
              <Controller
                control={control}
                name="locationName"
                render={({ field: { onChange, onBlur, name, value } }) => (
                  <TextField
                    type="text"
                    id={name}
                    name={name}
                    value={value}
                    autoComplete="off"
                    onChange={onChange}
                    onBlur={onBlur}
                    label={t("Location name")}
                    placeholder={t("Cool fablab")}
                    helpText={t("The name of the place where the asset is stored")}
                    error={errors.locationName?.message}
                    requiredIndicator={isRequired(schema, name)}
                  />
                )}
              />

              <Controller
                control={control}
                name="location"
                render={({ field: { onChange, onBlur, name, ref } }) => (
                  <SelectLocation
                    id={name}
                    name={name}
                    ref={ref}
                    onBlur={onBlur}
                    onChange={onChange}
                    label={t("Select the address")}
                    placeholder={t("Hamburg")}
                    error={errors.location?.message}
                    creatable={false}
                    requiredIndicator={isRequired(schema, name)}
                  />
                )}
              />
            </div>
            {error && (
              <Banner
                title={t("Error in Asset Claim")}
                status="critical"
                onDismiss={() => {
                  setError("");
                }}
              >
                <p className="whitespace-pre-wrap">{error}</p>
              </Banner>
            )}
            <Button size="large" primary fullWidth submit disabled={!isValid || isSubmitting} id="submit">
              {t("Claim Ownership")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["ResourceProps", "createProjectProps"])),
    },
  };
}
ClaimAsset.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default ClaimAsset;
