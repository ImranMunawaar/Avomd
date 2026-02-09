import { ModuleSources } from "@avomd/type-structure/realtimeDB";
import {
  TouchableOpacity,
  Linking,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { getHeight, getWidth } from "../services/helper";
type SourcesProps = { moduleSources: ModuleSources[] };
export default function ModuleSource(props: SourcesProps) {
  const { moduleSources } = props;
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.sourceText}>Source(s):</Text>
        {moduleSources?.map((s: ModuleSources, i: number) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              s.pdf
                ? Linking.openURL(s.pdf)
                : Linking.openURL(s.websiteLink || "");
            }}
          >
            <Text style={styles.moduleSource}>
              {i > 0 && ", "}
              {s.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginTop: getHeight(10),
    alignItems: "center",
    flexWrap: "wrap",
  },
  sourceText: {
    marginRight: 5,
    fontWeight: "400",
    lineHeight: getHeight(20),
    fontSize: getWidth(14),
    color: "#1E1F20",
  },
  moduleSource: {
    marginRight: 5,
    fontWeight: "400",
    lineHeight: getHeight(20),
    fontSize: getWidth(14),
    color: "#08A88E",
  },
});
