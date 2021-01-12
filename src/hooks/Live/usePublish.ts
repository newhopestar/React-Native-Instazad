import database from "@react-native-firebase/database";

export function usePublish(streamerUsername: string) {
  const liveStreamRef = database().ref("/liveStreams/" + streamerUsername);
  const liveStreamDetailsRef = database().ref("/liveStreamsDetails/" + streamerUsername);

  async function publish() {
    await liveStreamRef.onDisconnect().remove();
    await liveStreamDetailsRef.onDisconnect().remove();

    await liveStreamRef.set({ username: streamerUsername, startedAt: database.ServerValue.TIMESTAMP });
    await liveStreamDetailsRef.set({
      views: 0,
      messages: {},
      products: {
        1: {
          imageURL: "https://www.bobswatches.com/rolex-blog/wp-content/uploads/2016/01/Tiffany-Sub-Yellow-Gold.jpg",
          description: "Some Good rolex",
        },
        2: {
          imageURL: "https://www.subgmt.com/userdata/artikelen/instagram-what-is-next-on-the-site-30447-en-G.jpg",
          description: "Some not really good rolex",
        },
      },
      currentProductId: 1,
    });
  }

  async function unPublish() {
    await liveStreamRef.remove();
    await liveStreamDetailsRef.remove();
    await liveStreamRef.onDisconnect().cancel();
    await liveStreamDetailsRef.onDisconnect().cancel();
  }

  return { publish, unPublish };
}
