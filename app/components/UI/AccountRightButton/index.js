import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { toggleAccountsModal } from '../../../actions/modals';
import Device from '../../../util/device';
import AvatarAccount, {
  AvatarAccountType,
} from '../../../component-library/components/Avatars/AvatarAccount';
import AnalyticsV2 from '../../../util/analyticsV2';
import BadgeWrapper from '../../../component-library/components/Badges/BadgeWrapper';
import { BadgeVariants } from '../../../component-library/components/Badges/Badge/Badge.types';
import AvatarNetwork from '../../../component-library/components/Avatars/AvatarNetwork';
import { AvatarBaseSize } from '../../../component-library/components/Avatars/AvatarBase';
import Networks, { getDefaultNetworkByChainId } from '../../../util/networks';
import PopularList from '../../../util/networks/customNetworks';

const styles = StyleSheet.create({
  leftButton: {
    marginTop: 12,
    marginRight: Device.isAndroid() ? 7 : 18,
    marginLeft: Device.isAndroid() ? 7 : 0,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/**
 * UI PureComponent that renders on the top right of the navbar
 * showing an identicon for the selectedAddress
 */
class AccountRightButton extends PureComponent {
  static propTypes = {
    /**
     * Selected address as string
     */
    address: PropTypes.string,
    /**
     * Action that toggles the account modal
     */
    toggleAccountsModal: PropTypes.func,
    /**
     * List of accounts from the AccountTrackerController
     */
    accounts: PropTypes.object,
    /**
     * Account avatar type.
     * Possible ones are JazzIcon and Blockies
     */
    avatarAccountType: PropTypes.oneOf(Object.keys(AvatarAccountType)),
    /**
     * Currently connected network
     */
    network: PropTypes.string,
    /**
     * Boolean flag that identifies if dapp is connected or not
     */
    isDappConnected: PropTypes.bool,
  };

  static defaultProps = {
    /**
     * isDappConnected defaults to true while permission system
     * is in development & connect modals are not yet implemented.
     * TODO: Remove the default value once the Permission system feature gets completed
     */
    isDappConnected: true,
  };

  animating = false;

  toggleAccountsModal = () => {
    const { accounts } = this.props;
    if (!this.animating) {
      this.animating = true;
      this.props.toggleAccountsModal();
      setTimeout(() => {
        this.animating = false;
      }, 500);
    }
    // Track Event: "Opened Acount Switcher"
    AnalyticsV2.trackEvent(
      AnalyticsV2.ANALYTICS_EVENTS.BROWSER_OPEN_ACCOUNT_SWITCH,
      {
        number_of_accounts: Object.keys(accounts ?? {}).length,
      },
    );
  };

  /**
   * Get the current network name.
   *
   * @returns Current network name.
   */
  getNetworkName = (networkProvider) => {
    let name = '';
    if (networkProvider.nickname) {
      name = networkProvider.nickname;
    } else {
      const networkType = networkProvider.type;
      name = Networks?.[networkType]?.name || Networks.rpc.name;
    }
    return name;
  };

  /**
   * Get image source for either default MetaMask networks or popular networks, which include networks such as Polygon, Binance, Avalanche, etc.
   * @returns A network image from a local resource or undefined
   */
  getNetworkImageSource = (networkProvider) => {
    const defaultNetwork = getDefaultNetworkByChainId(networkProvider.chainId);
    if (defaultNetwork) {
      return defaultNetwork.imageSource;
    }
    const popularNetwork = PopularList.find(
      (network) => network.chainId === networkProvider.chainId,
    );
    if (popularNetwork) {
      return popularNetwork.rpcPrefs.imageSource;
    }
  };

  render = () => {
    const { address, avatarAccountType, isDappConnected, network } = this.props;

    const networkProvider = network.provider;

    const networkName = this.getNetworkName(network);
    const networkImage = this.getNetworkImageSource(networkProvider);

    const networkBadgeProps = {
      variant: BadgeVariants.Network,
      name: networkName,
      imageSource: networkImage,
    };

    return (
      <TouchableOpacity
        style={styles.leftButton}
        onPress={this.toggleAccountsModal}
        testID={'navbar-account-button'}
      >
        {isDappConnected ? (
          <BadgeWrapper badgeProps={networkBadgeProps}>
            <AvatarAccount type={avatarAccountType} accountAddress={address} />
          </BadgeWrapper>
        ) : (
          <AvatarNetwork
            size={AvatarBaseSize.Sm}
            name={networkName}
            imageSource={networkImage}
          />
        )}
      </TouchableOpacity>
    );
  };
}

const mapStateToProps = (state) => ({
  address: state.engine.backgroundState.PreferencesController.selectedAddress,
  accounts: state.engine.backgroundState.AccountTrackerController.accounts,
  network: state.engine.backgroundState.NetworkController,
  avatarAccountType: state.settings.useBlockieIcon
    ? AvatarAccountType.Blockies
    : AvatarAccountType.JazzIcon,
});

const mapDispatchToProps = (dispatch) => ({
  toggleAccountsModal: () => dispatch(toggleAccountsModal()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AccountRightButton);
