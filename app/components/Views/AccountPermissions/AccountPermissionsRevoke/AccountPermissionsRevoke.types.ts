// External dependencies.
// import { AccountConnectListProps } from '../../UI/AccountConnectList';

import { UseAccounts } from '../../../../components/UI/AccountSelectorList/hooks/useAccounts/useAccounts.types';
import { AccountPermissionsProps } from '../AccountPermissions.types';

/**
 * AccountPermissionsRevoke props.
 */
export interface AccountPermissionsRevokeProps
  extends AccountPermissionsProps,
    UseAccounts {
  onBack: () => void;
  isLoading?: boolean;
  permittedAddresses: string[];
  onRevokeAll: () => void;
}
