import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import axiosClient from '../../api';




/* const HolidayBanner = ({ themeStyles }) => {
   const [promo, setPromo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  const fetchPromo = async () => {
    setLoading(true); // show spinner while fetching
    try {
      const res = await axiosClient.get('/api/nilemart/promotions/promotion');
      const data = await res.data; 
      setPromo(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  fetchPromo();
}, []);

  if (loading) {
    return <ActivityIndicator color={themeStyles.text} />;
  } 

  if (!promo) {
    return null; // no banner to show
  }

  return (
    <View style={[styles.banner(themeStyles.primary)]}>
        <Text style={styles.title(themeStyles.text)}>{promo.title}</Text>
      <Text style={styles.subtitle(themeStyles.text)}>{promo.message}</Text>
      {promo.cta && <Text style={styles.cta(themeStyles.text)}>{promo.cta}</Text>}
    </View>
  );
}; */
let cachedPromo = null; // keeps data across mounts
let cachedDate = null;  // stores which day it was fetched

const HolidayBanner = ({ themeStyles }) => {
  const [promo, setPromo] = useState(cachedPromo);
  const [loading, setLoading] = useState(!cachedPromo);
  const todayDate = dayjs().format('YYYY-MM-DD');

  useEffect(() => {
    const fetchPromo = async () => {
      // Only fetch if cache is empty or stale (different day)
      if (!cachedPromo || cachedDate !== todayDate) {
        setLoading(true);
        try {
          const res = await axiosClient.get('/api/nilemart/promotions/promotion');
          cachedPromo = res.data;
          cachedDate = todayDate;
          setPromo(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPromo();
  }, [todayDate]);

  if (loading) {
    return <ActivityIndicator color={themeStyles.text} />;
  }

  if (!promo) {
    return null; // no banner to show
  }

  return (
    <View style={[styles.banner(themeStyles.primary)]}>
      <Text style={styles.title(themeStyles.text)}>{promo.title}</Text>
      <Text style={styles.subtitle(themeStyles.text)}>{promo.message}</Text>
      {promo.cta && <Text style={styles.cta(themeStyles.text)}>{promo.cta}</Text>}
    </View>
  );
};



const styles = {
  banner: (bg) => ({
    backgroundColor: bg,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12
  }),
  title: (color) => ({
    color,
    fontWeight: 'bold',
    fontSize: 18
  }),
  subtitle: (color) => ({
    color,
    opacity: 0.9,
    marginTop: 4
  }),
  cta: (color) => ({
    color,
    fontStyle: 'italic',
    marginTop: 8
  })
};

export default HolidayBanner;
