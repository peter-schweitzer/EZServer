import package_json from '../../package.json' with { type: 'json' };
const { version } = package_json;

/** @implements Middleware */
export class DefaultHeaders {
  #set_x_powered_by;
  #force_http_upgrade;

  /**
   * @param {object} [options={}] optional options
   * @param {boolean} [options.poweredBy=true]
   * @param {boolean} [options.forceHTTPS=false]
   */
  constructor({ poweredBy = true, forceHTTPS = false } = {}) {
    this.#set_x_powered_by = poweredBy;
    this.#force_http_upgrade = forceHTTPS;
  }

  /**
   * @param {EZIncomingMessage} _req
   * @param {ServerResponse} res
   * @param {LUT<string>} _query
   * @param {RouteLUT} _route
   * @returns {Promise<void|string>}
   */
  async handle(_req, res, _query, _route) {
    const head = new Headers();

    if (this.#set_x_powered_by) head.set('X-Powered-By', 'EZServer-v' + version);
    if (this.#force_http_upgrade) {
      head.append('Strict-Transport-Security', 'max-age=31536000');
      head.append('Strict-Transport-Security', 'includeSubDomains');
    }

    head.set('X-Content-Type-Options', 'nosniff');

    head.append('Content-Security-Policy', "default-src 'self'");
    head.append('Content-Security-Policy', "base-uri 'self'");
    head.append('Content-Security-Policy', "font-src 'self' https: data:");
    head.append('Content-Security-Policy', "form-action 'self'");
    head.append('Content-Security-Policy', "frame-ancestors 'self'");
    head.append('Content-Security-Policy', "img-src 'self' data:");
    head.append('Content-Security-Policy', "object-src 'none'");
    head.append('Content-Security-Policy', "script-src 'self'");
    head.append('Content-Security-Policy', "script-src-attr 'none'");
    head.append('Content-Security-Policy', "style-src 'self' https: 'unsafe-inline'");

    head.set('Cross-Origin-Resource-Policy', 'same-origin');

    res.setHeaders(head);
  }
}
