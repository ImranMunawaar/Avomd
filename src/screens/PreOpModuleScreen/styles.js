import { Platform, StyleSheet } from "react-native";

export default styles = StyleSheet.create({
  searchContainer: {
    marginStart: 18,
    marginEnd: 18,
    borderRadius: 53 / 2,
    elevation: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowOffset: {
      height: 4,
      width: 0
    },
    shadowRadius: 4,
    backgroundColor: "white",
    flex: 1
  },
  searchInputContainer: {
    alignItems: "center",
    flexDirection: "row",
    height: 39
  },
  searchInput: { fontSize: 16 },
  loadingIndicatorContainer: {
    ...StyleSheet.absoluteFill,
    display: "flex",
    alignContent: "center",
    justifyContent: "center"
  },
  loadingIndicatorBackground: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "grey",
    opacity: 0.7
  },
  cardStyle: {
    marginStart: 27,
    marginEnd: 24,
    marginBottom: 13,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowOffset: {
      height: 4,
      width: 0
    },
    shadowRadius: 4,
    borderColor: "transparent",
    backgroundColor: "white",
    paddingHorizontal: 19,
    paddingVertical: 15,
    paddingBottom: 30
  },
  titleText: {
    fontSize: 18,
    color: 'black',
    marginBottom: 3
  },
  authorText: {
    fontSize: 13,
    color: '#515151',
    fontStyle: 'italic'
  },
  timeText: {
    fontSize: 11,
    color: '#B4B4B4',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: '#515151',
    fontStyle: 'italic'
  }
});
