import { useLayoutContext } from "@/components/layout/layout-context";

export interface FeaturePermissions {
    ReadPermission: number;
    AddPermission: number;
    EditPermission: number;
    DeletePermission: number;
    FeatureTitleEnglish: string;
}

export const usePermission = (featureName: string) => {
    const { getFeaturePermissions } = useLayoutContext();
    const permissions = getFeaturePermissions(featureName) as FeaturePermissions | null;

    return {
        canRead: permissions?.ReadPermission === 1,
        canAdd: permissions?.AddPermission === 1,
        canEdit: permissions?.EditPermission === 1,
        canDelete: permissions?.DeletePermission === 1,
        loading: !permissions && permissions !== null, // If it's null, we've checked and it's not there.
    };
};
