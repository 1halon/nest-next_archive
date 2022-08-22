import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Checkbox,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  BookmarkAdded,
  BookmarkBorder,
  BookmarkRemove,
  ExpandMore,
  FileDownloadOutlined,
  MoreVert,
  OpenInNewOutlined,
  EditOutlined,
  AttachFileOutlined,
  RestoreOutlined,
  DeleteOutline,
  ReceiptLongOutlined,
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Dispatch, useEffect, useState } from "react";
import { common } from "@mui/material/colors";
import { DateTime } from "luxon";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import { useDispatch, useSelector } from "react-redux";
import { remove } from "../reducers/billcard";
import { request } from "../../pages/_app";

export const types = [
  "AİDAT",
  "ALIŞVERİŞ",
  "ELEKTRİK",
  "GAZ",
  "İNTERNET",
  "KİRA",
  "SU",
  "TELEFON",
] as const;
export type Types = typeof types[number];

export const props = {
    createdBy: null as string,
    date: Date.now(),
    description: "",
    editable: false,
    id: null as string,
    get receipt() {
      if (this.id) return `/cdn/receipts/${this.id}.pdf`;
    },
    saved: false,
    type: types[0] as Types,
  },
  propsFromStates = (obj, states, keys, index) => {
    const key = keys[index];
    obj[key] = states[key]?.value;
    if (index < keys.length)
      return propsFromStates(obj, states, keys, index + 1);
    return obj;
  };
export type Props = {
  [key in keyof typeof props]?: typeof props[key];
};

type States = {
  [key in keyof Props]: {
    set: Dispatch<Props[key]>;
    value: Props[key];
  };
};

const BillCard = (_props: Partial<Props>) => {
  const { username } = useSelector((state: any) => state.user),
    dispatch = useDispatch(),
    [anchorEl, setAnchorEl] = useState<null | HTMLButtonElement>(null),
    [changed, setChanged] = useState(false),
    [expanded, setExpanded] = useState(false),
    [loading, setLoading] = useState(false),
    [savedHovered, setSavedHovered] = useState(false),
    [upload, setUpload] = useState<any>();

  props.id = _props?.id;
  const states = {} as States;

  for (const key in props) {
    const prop = _props[key] ?? props[key],
      // eslint-disable-next-line react-hooks/rules-of-hooks
      [value, setValue] = useState(prop);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => setValue(prop), [prop]);

    // @ts-ignore
    states[key as keyof Props] = {
      set: function () {
        if (!changed && key !== "editable") setChanged(true);
        return setValue.apply(this, [arguments[0]]);
      } as never,
      value: value as never,
    };
  }

  const dateTime = () =>
    DateTime.fromSeconds((states.date?.value as number) / 1000).toFormat(
      "LLLL, yyyy",
      {
        locale: "tr",
      }
    );

  useEffect(() => {
    if (loading) {
      const data = new FormData();
      // @ts-ignore
      for (const key in states)
        data.append(key, states[key as keyof Props].value as any);

      data.delete("editable");
      data.delete("saved");

      delete upload?.url;
      upload && data.append("file", upload);

      request(
        `/cards${(states.id.value && `/${states.id.value}`) || ""}`,
        states.id?.value ? "PATCH" : "POST",
        data
      )
        .then((res) => {
          for (const key in res) {
            const value = res[key];
            value !== states[key].value && states[key].set(value);
          }
          setUpload(null);
        })
        .catch(
          () =>
            states.id?.value ||
            dispatch(
              remove(propsFromStates({}, states, Object.keys(states), 0))
            )
        )
        .finally(() => {
          setChanged(false);
          setLoading(false);
          states.editable?.set(false);
        });
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card
      sx={{
        maxWidth: 345,
      }}
    >
      <CardHeader
        avatar={
          !states.editable?.value && (
            <Avatar sx={{ color: "text.primary", bgcolor: common.black }}>
              <ReceiptLongOutlined />
            </Avatar>
          )
        }
        action={
          !states.editable?.value && (
            <IconButton
              onClick={({ currentTarget }) => setAnchorEl(currentTarget)}
            >
              <MoreVert />
            </IconButton>
          )
        }
        title={
          (states.editable?.value && (
            <TextField
              disabled={loading}
              select
              label="Fatura Türü"
              value={states.type?.value ?? types[0]}
              defaultValue={types[0]}
              fullWidth
              sx={{ mb: "1rem" }}
              onChange={({ target: { value } }) =>
                states.type?.set(value as Types)
              }
            >
              {types.map((type, index) => (
                <MenuItem key={index} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          )) ||
          states.type?.value
        }
        subheader={
          (states.editable?.value && (
            <DesktopDatePicker
              disabled={loading}
              label="Fatura Tarihi"
              inputFormat="MM/yyyy"
              value={dateTime()}
              onChange={(value: any) => states.date?.set(value.toSeconds())}
              renderInput={(params) => <TextField {...params} />}
            />
          )) ||
          dateTime()
        }
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            states.editable?.set(!states.editable?.value);
            setAnchorEl(null);
          }}
        >
          {!states.editable?.value && (
            <Button
              sx={{ backgroundColor: "transparent !important" }}
              startIcon={<EditOutlined />}
              onClick={() => states.editable?.set(!states.editable?.value)}
            >
              Düzenle
            </Button>
          )}
        </MenuItem>
        <MenuItem>
          <Button
            sx={{ backgroundColor: "transparent !important" }}
            startIcon={<DeleteOutline />}
            onClick={() => {
              request(`/cards/${states.id.value}`, "DELETE")
                .catch(() => {})
                .finally(() =>
                  dispatch(
                    remove(propsFromStates({}, states, Object.keys(states), 0))
                  )
                );
            }}
          >
            Sil
          </Button>
        </MenuItem>
        <Divider />
        <MenuItem>
          <Grid container sx={{ alignItems: "center" }}>
            <Grid item>
              <Tooltip title={username}>
                <Avatar
                  sx={{
                    color: "text.primary",
                    bgcolor: common.black,
                  }}
                >
                  {username[0].toUpperCase()}
                </Avatar>
              </Tooltip>
            </Grid>
            <Grid item sx={{ margin: "0 1.25vh" }}>
              Oluşturan
            </Grid>
          </Grid>
        </MenuItem>
      </Menu>

      <CardContent>
        {(states.editable?.value && (
          <TextField
            disabled={loading}
            label="Fatura Açıklaması"
            variant="standard"
            value={states.description?.value}
            onChange={({ target: { value } }) => states.description?.set(value)}
          />
        )) ||
          (states.description?.value && (
            <Typography variant="body2" color="text.secondary">
              {states.description?.value}
            </Typography>
          ))}
      </CardContent>

      <CardActions
        disableSpacing
        sx={{ "& .MuiIconButton-root span": { display: "flex" } }}
      >
        {(states.editable?.value && (
          <>
            <IconButton
              disabled={loading}
              sx={{ zIndex: 1 }}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "application/pdf";
                input.oninput = async () => {
                  const file = input?.files?.item(0) as File & {
                    url: string;
                  };
                  file.url = URL.createObjectURL(
                    new Blob([await file.arrayBuffer()], {
                      type: file.type,
                    })
                  );
                  setUpload(file);
                  input.remove();
                  setChanged(true);
                };
                input.click();
              }}
            >
              <Tooltip title="Dekont Yükle">
                <span>
                  <AttachFileOutlined />
                </span>
              </Tooltip>
            </IconButton>

            {upload && states.receipt?.value && (
              <IconButton disabled={loading} onClick={() => setUpload(false)}>
                <Tooltip title="Dekontu Geri Al">
                  <span>
                    <RestoreOutlined />
                  </span>
                </Tooltip>
              </IconButton>
            )}

            {(changed && (
              <LoadingButton
                //disabled={loading}
                loading={loading}
                sx={{ ml: "auto" }}
                onClick={() => {
                  setExpanded(false);
                  setLoading(true);
                }}
              >
                Kaydet
              </LoadingButton>
            )) || (
              <Button
                disabled={loading}
                sx={{ ml: "auto" }}
                onClick={() => {
                  if (states.id.value) {
                    setExpanded(false);
                    states.editable.set(false);
                  } else dispatch(remove(_props));
                }}
              >
                İptal
              </Button>
            )}
          </>
        )) || (
          <>
            <Tooltip title={(states.saved && "Remove") || "Save"}>
              <Checkbox
                sx={{ color: "white" }}
                icon={(savedHovered && <BookmarkAdded />) || <BookmarkBorder />}
                checkedIcon={
                  (savedHovered && <BookmarkRemove />) || <BookmarkAdded />
                }
                onChange={() => states.saved?.set(!states.saved.value)}
                onMouseEnter={() => setSavedHovered(true)}
                onMouseLeave={() => setSavedHovered(false)}
              />
            </Tooltip>
            <IconButton
              onClick={() => {
                const link = document.createElement("a");
                link.href = states.receipt?.value as string;
                link.download = "Fatura.pdf";
                link.target = "_blank";
                link.click();
                link.remove();
              }}
            >
              <Tooltip title="Dekontu İndir">
                <FileDownloadOutlined />
              </Tooltip>
            </IconButton>
            <IconButton target="_blank" href={states.receipt?.value as string}>
              <Tooltip title="Dekontu Aç">
                <OpenInNewOutlined />
              </Tooltip>
            </IconButton>
            <IconButton
              sx={{
                transform: !expanded ? "rotate(0deg)" : "rotate(180deg)",
                marginLeft: "auto",
                transition: (theme) =>
                  theme.transitions.create("transform", {
                    duration: theme.transitions.duration.shortest,
                  }),
              }}
              onClick={() => setExpanded(!expanded)}
            >
              <Tooltip title="Dekontu Göster">
                <ExpandMore />
              </Tooltip>
            </IconButton>
          </>
        )}
      </CardActions>
      {(states.editable?.value && upload && (
        <Collapse in={true} timeout="auto">
          <CardMedia component="iframe" height={"200vh"} src={upload.url} />
        </Collapse>
      )) || (
        <Collapse
          in={states.editable?.value ? !loading : expanded}
          timeout="auto"
        >
          <CardMedia
            component="iframe"
            height={"200vh"}
            src={
              (states.editable?.value && upload && upload.url) ||
              states.receipt?.value
            }
          />
        </Collapse>
      )}
    </Card>
  );
};

export const BillCardSkeleton = () => {
  return (
    <Skeleton animation="wave" variant="rounded" width="32vh" height="51vh" />
  );
};

export default BillCard;
