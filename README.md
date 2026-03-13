# n8n-nodes-trackpod

Custom n8n community node for [Track-POD](https://track-pod.com) — a delivery management platform.

## What's included

### Action node — Track-POD

| Resource | Operation | API endpoint |
|---|---|---|
| Order | Get Details | `GET /order/{getBy}/{key}` |
| Order | Create Orders | `POST /order/bulk` |
| Order | Update Order | `PUT /order` |
| Order | Delete Order | `DELETE /Order/{deleteBy}/{key}` |

### Trigger node — Track-POD Trigger

| Event | Track-POD webhook events |
|---|---|
| New / Updated Route | RouteCreated, RouteUpdated |
| Deleted Route | RouteDeleted |
| New / Updated Order | OrderCreated, OrderUpdated |
| Deleted Order | OrderDeleted |

---

## Setup

### Prerequisites

- n8n self-hosted (any recent version)
- Node.js ≥ 16

### Install & build

```bash
# From the package root
npm install
npm run build
```

### Link into n8n

n8n loads community nodes from its custom extensions directory.

```bash
export N8N_CUSTOM_EXTENSIONS="$HOME/.n8n/custom"
mkdir -p "$N8N_CUSTOM_EXTENSIONS"

# Symlink for development — re-run `npm run build` after any code change
ln -s "$(pwd)/dist" "$N8N_CUSTOM_EXTENSIONS/n8n-nodes-trackpod"
```

Restart n8n after linking.

### Add credentials

1. In n8n go to **Credentials → New**.
2. Search for **Track-POD API**.
3. Paste your API key — find it at [Track-POD → Settings → Integrations → Web API](https://web.track-pod.com/en/settings/integrations/web-api).
4. Click **Test** to verify, then **Save**.

---

## Action node usage

### Get Details

Looks up a single order. Returns the full order object, or an empty `{}` on 404 / 410 (order not found or deleted) rather than failing — downstream nodes can check for missing fields to branch.

| Field | Description |
|---|---|
| **Get By** | `Number` · `ID` · `Tracking-ID` |
| **Order Number / Order ID / Tracking ID** | The lookup key (shown conditionally) |

### Create Orders

Collects **all input items** into one array and sends them in a single `POST /order/bulk` call. Returns one output item with the API response.

| Field | Description |
|---|---|
| **Client / Customer Name** | Required by Track-POD |
| **Address** | Required by Track-POD |
| **Force Update Address GPS** | Updates Lat/Lon in the Addresses directory |
| **Force Update Goods Price** | Updates Price in the Goods directory |
| **Additional Fields** | All other optional order fields (Number, Date, Type, GoodsList, etc.) |

`GoodsList` and `CustomFields` in Additional Fields accept a JSON array string, e.g. `[{"GoodsName":"Item A","Quantity":2,"GoodsUnit":"pcs"}]`.

### Update Order

Sends `PUT /order` per input item. Include at least **ID** or **Number** in Order Fields to identify which order to update. Only the most recent matching order is updated.

| Field | Description |
|---|---|
| **Force Update Address GPS** | Updates Lat/Lon in the Addresses directory |
| **Order Fields** | Collection of all order fields including Id, Number, Client, Address, etc. |

### Delete Order

Sends `DELETE /Order/{deleteBy}/{key}` per input item.

| Field | Description |
|---|---|
| **Delete By** | `Number` · `ID` |
| **Order Number / Order ID** | The key (shown conditionally) |

---

## Trigger node usage

Add a **Track-POD Trigger** node to start a workflow from a Track-POD webhook event.

1. Select the **Event** you want to listen for.
2. **Activate** the workflow — the Webhook URL appears in the node.
3. Copy the Webhook URL and register it in [Track-POD → Settings → Integrations → Webhooks](https://web.track-pod.com/en/settings/integrations/webhooks).
4. In the Track-POD webhook settings, enable the corresponding events (shown as a notice in the node UI).

Each trigger node instance has its own URL. If you need to handle multiple event types in one workflow, add one trigger node per event and register each URL separately in Track-POD.

### Output structure

All trigger events pass the raw Track-POD webhook payload as-is:

```json
{
  "Metadata": {
    "Event": "OrderCreated",
    "Date": "2024-01-15T10:30:00Z"
  },
  "Data": { }
}
```

`Data` shape per event:

| Event | Data fields |
|---|---|
| New / Updated Route | Full route object (Code, Date, Depot, DriverName, Orders array, …) |
| Deleted Route | `Code`, `Date` |
| New / Updated Order | Full order object (Number, Client, Address, Status, GoodsList, …) |
| Deleted Order | `Number`, `Date`, `Type`, `Note`, `Weight`, `Volume`, `Pallets`, `COD`, `DeletedBy`, `DeletedDate` |

---

## Development

```bash
npm run dev   # watch mode — recompiles on every save
```
