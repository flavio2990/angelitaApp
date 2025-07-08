import { View, StyleSheet } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const TopBarHeader = ({
  showTopBar = false,
  topBarTitle,
  onBack,
  style,
  centerTopbarTitle = false,
}) => {
  if (!showTopBar) return null;

  return (
    <SafeAreaView edges={['top']} style={[styles.safeAreaStyle, style]}>
      <View style={styles.topBar}>
        <View style={styles.left}>
          {onBack && (
            <IconButton
              icon="arrow-left"
              onPress={onBack}
              style={styles.backButton}
              iconColor="white"
              size={28}
            />
          )}
        </View>
        <View style={styles.center}>
          <Text
            style={[
              styles.topbarTextTitle,
              centerTopbarTitle && { textAlign: 'center' },
              { marginLeft: -22 },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {topBarTitle}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TopBarHeader;

const styles = StyleSheet.create({
  safeAreaStyle: {
    backgroundColor: '#5124A5',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 56,
    backgroundColor: '#5124A5',
  },
  left: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    marginLeft: 0,
    marginRight: 0,
    alignSelf: 'center',
  },
  topbarTextTitle: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});