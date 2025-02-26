import React, { useEffect, useState, useCallback } from "react";
import { StatusBar, FlatList } from "react-native";

import {
  Container,
  Logo,
  SafeArea,
  LogoContainer,
  Post,
  Header,
  Avatar,
  Description,
  Name,
  Loading
} from "./styles";
import LazyImage from "../../components/LazyImage";

const logo = require("../../assets/img/instagram.png");

const feed = () => {
  const [feed, setFeed] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [viewlable, setViewlable] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  async function loadPage(pageNumber: number = page, shouldRefresh?: boolean) {
    if (total && pageNumber > total) return;

    setLoading(true);

    const response = await fetch(
      `http://localhost:3000/feed?_expand=author&_limit=5&_page=${pageNumber}`
    );

    const data = await response.json();
    const totalItems = response.headers.get("X-Total-Count");

    setTotal(Math.floor(totalItems / 5));
    setFeed(shouldRefresh ? data : [...feed, ...data]);
    setPage(page + 1);
    setLoading(false);
  }

  useEffect(() => {
    loadPage();
  }, []);

  async function refreshList() {
    setRefreshing(true);
    await loadPage(1, true);
    setRefreshing(false);
  }

  const handleViewlableChange = useCallback(({ changed }) => {
    setViewlable(changed.map(({ item }) => item.id));
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="dark" />
      <SafeArea />
      <Container>
        <LogoContainer>
          <Logo source={logo} />
        </LogoContainer>
        <FlatList
          data={feed}
          onEndReached={() => loadPage()}
          onEndReachedThreshold={0.1}
          onRefresh={refreshList}
          refreshing={refreshing}
          onViewableItemsChanged={handleViewlableChange}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 10 }}
          ListFooterComponent={loading && <Loading />}
          keyExtractor={(post: any = {}) => String(post.id)}
          renderItem={({ item }) => (
            <Post>
              <Header>
                <Avatar source={{ uri: item.author.avatar }} />
                <Name>{item.author.name}</Name>
              </Header>
              <LazyImage
                shouldLoad={viewlable.includes(item.id)}
                aspectRatio={item.aspectRatio}
                smallSource={{ uri: item.small }}
                source={{ uri: item.image }}
              />
              <Description>
                <Name>{item.author.name}</Name> {item.description}
              </Description>
            </Post>
          )}
        />
      </Container>
    </>
  );
};

export default feed;
