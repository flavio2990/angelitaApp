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
    <View style={[styles.safeAreaStyle, style]}>
      <View style={styles.topBar}>
        <View style={styles.left}>
          {onBack && (
            <IconButton
              icon="arrow-left"
              onPress={() => {
                onBack();
              }}
              style={styles.backButton}
              iconColor="white"
              size={24}
            />
          )}
        </View>
        <View style={styles.center}>
          <Text
            style={[
              styles.topbarTextTitle,
              centerTopbarTitle && { textAlign: 'center' },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {topBarTitle}
          </Text>
        </View>
        <View style={styles.right} />
      </View>
    </View>
  );
};

export default TopBarHeader;

const styles = StyleSheet.create({
  safeAreaStyle: {
    backgroundColor: '#5124A5',
    paddingTop: 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 50,
    backgroundColor: '#5124A5',
  },
  left: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: {
    width: 36,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    marginLeft: 0,
    marginRight: 0,
  },
  topbarTextTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
});