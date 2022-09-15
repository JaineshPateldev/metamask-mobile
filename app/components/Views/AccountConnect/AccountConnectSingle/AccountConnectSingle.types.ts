// External dependencies.
import { AccountConnectProps } from '..';
import { Account } from '../../../UI/AccountSelectorList';

/**
 * AccountConnectSingle props.
 */
export interface AccountConnectSingleProps extends AccountConnectProps {
  onOpenSingleConnectSelector: () => void;
  openOpenMultiConnectSelector: () => void;
  defaultSelectedAccount: Account | undefined;
  onCancel: () => void;
  onConnect: () => void;
  isLoading?: boolean;
}
